
from collections import defaultdict
from imapclient import IMAPClient
from concurrent.futures import ThreadPoolExecutor, as_completed
import ssl
import email
from email.utils import parseaddr
from email.header import decode_header, make_header
from datetime import datetime
import re
import langid
import numpy as np
import regex
import logging
from bs4 import BeautifulSoup


from api.core.config import settings
from application.exceptions import INFRA_ERROR_LAYERS, InfrastructureError, InfrastructureWarning
from domain.domain_models.Email import EmailMeta, InboxMeta, Email
from domain.domain_models.Requests import InboxCriteria


_BRACE_PATTERN = re.compile(r"<[^>]*>|\[[^\]]*\]|\{[^\}]*\}")
_URL_PATTERN = re.compile(r"http\S+|www\.\S+")
_DOLLAR_PATTERN = re.compile(r"\$\w+")
NON_ASCI_PATTERN= re.compile(r"[^\x20-\x7E\n]")
_IMG_PATTERN = re.compile(r'\[Image\s*:?\s*"[^"]+"\]|\[image:[^\]]+\]|\[cid:[^\]]+\]', re.IGNORECASE)
REPEATED_STRANGE_CHARS = re.compile(r"(.)\1{4,}")
MULTIPLE_WHITE_SPACES_PATTERN = re.compile(r"[^\S\n]+")
MULTIPLE_NEWLINES_PATTERN = re.compile(r"\n{3,}")
_PHONE_LINE_PATTERN = re.compile(r"(?i)\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b")
_EMPTY_PARENS_PATTERN = re.compile(r"\(\s*\)")
_FOOTER_KEYWORDS_PATTERN = re.compile(
    r"(?i)\b(about us|help center|privacy policy|affiliate program|unsubscribe|manage preferences|"
    r"view in browser|terms( of service)?|contact us|linkedin|facebook|discord)\b|(?<!\w)x(?!\w)"
)
_ADDRESS_LINE_PATTERN = re.compile(
    r"(?i)^\s*\d{1,6}\s+[\w .,'-]+\b(?:street|st|avenue|ave|road|rd|drive|dr|boulevard|blvd|lane|ln|"
    r"suite|ste|floor|fl|way|place|pl|court|ct|parkway|pkwy)\b[\w .,'-]*,\s*[A-Za-z .'-]+,\s*"
    r"[A-Z]{2}\s+\d{5}(?:-\d{4})?\s*$"
)


error_logger = logging.getLogger("error_logger")




class EmailParsingHelper:
    @staticmethod
    def normalize_flags(flags) -> list[str]:
        if not flags:
            return []
        normalized = []
        for flag in flags:
            if isinstance(flag, bytes):
                normalized.append(flag.decode("utf-8", errors="ignore"))
            else:
                normalized.append(str(flag))
        return normalized

    @staticmethod
    def _sort_uids_dates(uids: list[int], dates: list[datetime], reverse: bool = True) -> list[int]:
        if not uids:
            return []

        try:
            if len(uids) != len(dates):
                raise ValueError("uids and dates must have the same length")

            pairs = list(zip(uids, dates))
            pairs.sort(
                key=lambda item: item[1].timestamp() if isinstance(item[1], datetime) else float("-inf"),
                reverse=reverse,
            )
            return [uid for uid, _ in pairs]
        except Exception as ex:
            raise InfrastructureError(
                f"Error sorting uids dates",
                layer=INFRA_ERROR_LAYERS.IMAP,
                priority=2,
                ex=ex
            )

    @staticmethod
    def _sort_uids_senders(uids: list[int], senders: list[str]) -> list[int]:
        if not uids:
            return []
        try:

            if len(uids) != len(senders):
                raise ValueError("uids and senders must have the same length")

            pairs = list(zip(uids, senders))
            pairs.sort(key=lambda item: (item[1] or "").strip().lower())
            return [uid for uid, _ in pairs]
        except Exception as ex:
            raise InfrastructureError(
                f"Error sorting uids senders",
                layer=INFRA_ERROR_LAYERS.IMAP,
                priority=2,
                ex=ex
            )

    @staticmethod
    def get_sender_signature(email):
        if "@" not in email:
            return None
        d = email.rsplit("@", 1)[1]
        if "." not in d:
            return d
        return d.split(".")[-2]

    @staticmethod
    def decode_sender(sender):
        if not sender:
            return "", ""
        name, sender_email = parseaddr(sender)
        if name:
            sender_signature = str(make_header(decode_header(name)))
        else:
            sender_signature = name
        if sender_email:
            sender_signature = EmailParsingHelper.get_sender_signature(sender_email)
        return sender_signature, sender_email, name

    @staticmethod
    def decode_subject(subject):
        if not subject:
            return ""
        decoded_subject = str(make_header(decode_header(subject)))
        return decoded_subject

    @staticmethod
    def get_header_meta(raw_header) -> EmailMeta:
        """
        Parameters:
        -------------
        raw_header: bytes of email header fetched from imap with RFC822.HEADER
        Returns:
        -------------
            EmailMeta object with sender_signature, sender_email, subject, date
        """
        meta = email.message_from_bytes(raw_header)
        sender_signature, sender_email, _ =  EmailParsingHelper.decode_sender(meta.get("From"))
        subject = EmailParsingHelper.decode_subject(meta.get("Subject"))
        email_meta = EmailMeta(
            sender_signature=sender_signature,
            sender_email=sender_email,
            subject=subject,
            date=meta.get("Date")
        )
        return email_meta

    @staticmethod
    def _strip_footer_lines(text: str) -> str:
        if not text:
            return ""

        # Keep original behavior, but avoid O(n) pop(0)
        lines = [ln.strip() for ln in text.splitlines()]
        if not lines:
            return ""

        start = 0
        end = len(lines) - 1

        while start <= end and not lines[start]:
            start += 1
        while end >= start and not lines[end]:
            end -= 1
        if start > end:
            return ""

        i = end
        removed_footer_tail = False
        while i >= start:
            line = lines[i]
            low = line.lower()

            is_footer_line = (
                not line
                or _FOOTER_KEYWORDS_PATTERN.search(line)
                or low.startswith("unsubscribe")
                or low.startswith("manage preferences")
                or _PHONE_LINE_PATTERN.search(line)
                or _ADDRESS_LINE_PATTERN.search(line)
            )

            if is_footer_line:
                removed_footer_tail = True
                i -= 1
                continue

            # Keep removing adjacent footer/nav rows above already-detected footer tail.
            if removed_footer_tail and "|" in line and _FOOTER_KEYWORDS_PATTERN.search(line):
                i -= 1
                continue

            break

        return "\n".join(lines[start : i + 1]).strip()

    @staticmethod
    def clean_mail_text(text):
        if not text:
            return ""

        text = text.replace("\r\n", "\n").replace("\r", "\n")

        # Fast path: only parse HTML when it looks like HTML
        if "<" in text and ">" in text:
            soup = BeautifulSoup(text, "html.parser")
            for element in soup(["script", "style", "meta", "noscript", "head", "title", "img"]):
                element.decompose()
            text = soup.get_text(separator="\n")

        text = EmailParsingHelper._strip_footer_lines(text)

        # Run regex only when relevant markers exist
        if "[" in text:
            text = _IMG_PATTERN.sub(" ", text)
            text = _BRACE_PATTERN.sub(" ", text)
        if "http" in text or "www." in text:
            text = _URL_PATTERN.sub("", text)
        if "(" in text:
            text = _EMPTY_PARENS_PATTERN.sub(" ", text)
        if "$" in text:
            text = _DOLLAR_PATTERN.sub(" ", text)

        text = NON_ASCI_PATTERN.sub(" ", text)
        text = regex.sub(r"\p{So}", " ", text)
        text = REPEATED_STRANGE_CHARS.sub(" ", text)
        lines = [MULTIPLE_WHITE_SPACES_PATTERN.sub(" ", line).strip() for line in text.split("\n")]
        text = "\n".join(lines)
        text = MULTIPLE_NEWLINES_PATTERN.sub("\n\n", text)
        return text.strip()


    @staticmethod
    def parse_mail_content(raw_mail):
        """
        Returns
        ----------
        (content_text, content_clean, content_html, contains_attachement)
        """
        plain_text_parts = []
        html_parts = []
        contains_attachement = False
        for part in raw_mail.walk():
            content_type = part.get_content_type()
            filename = part.get_filename()

            if filename:
                contains_attachement = True
                continue
            payload = part.get_payload(decode=True)

            if not payload:
                continue

            charset = part.get_content_charset() or "utf-8"
            try:
                payload = payload.decode(charset, errors="ignore")
            except Exception:
                payload = payload.decode("utf-8", errors="ignore")
                InfrastructureWarning(
                    f"error payload decoding using encoding: {charset}, we will encode using utf-8",
                    layer=INFRA_ERROR_LAYERS.PROCESSING
                )



            if content_type == "text/plain":
                text_body = payload.strip()
                plain_text_parts.append(text_body)


            elif content_type == "text/html":
                soup = BeautifulSoup(payload, "html.parser")
                if soup.body:
                    body_html = "".join(str(c) for c in soup.body.contents)  # keep inner HTML
                else:
                    body_html = payload  # fallback if no <body>
                html_parts.append(body_html)

        ## FALLBACK if email has no text/plain but only text/html parts
        if len(plain_text_parts) == 0 and len(html_parts) > 0:
            for html_content in html_parts:
                plain_text_parts.append(html_content)


        content_text = "\n\n".join(plain_text_parts) if plain_text_parts else ""
        content_html = "\n\n".join(html_parts) if html_parts else ""

        content_clean = EmailParsingHelper.clean_mail_text(content_text)

        return content_text, content_clean, content_html, contains_attachement



    @staticmethod
    def get_email(raw_mail, uid, flags=None) -> Email | None:
        try:
            raw = email.message_from_bytes(raw_mail)
            sender_signature, sender_email, sender_name =  EmailParsingHelper.decode_sender(raw.get("From"))
            content_text, content_clean, content_html, contains_attachement = EmailParsingHelper.parse_mail_content(raw)
            subject = EmailParsingHelper.decode_subject(raw.get("Subject"))
            language, _ = langid.classify(content_clean)
            parsed_flags = EmailParsingHelper.normalize_flags(flags)
            parsed_email = Email(
                uid=uid,
                email_id=uid,
                raw_message=raw,
                sender_name=sender_name,
                message_id = raw.get("Message-ID"),
                subject= subject,
                date = raw.get("Date"), 
                sender_email=sender_email,
                sender_signature= sender_signature,
                content_text = content_text,
                content_clean=content_clean,
                content_html=content_html,
                contains_attachement=contains_attachement,
                flags=parsed_flags,
                language=language,
            )
            return parsed_email
        except Exception as ex:
            error_logger.error(
                f"INFRASTRUCTURE ERROR | Layer: {INFRA_ERROR_LAYERS.PROCESSING.value} | "
                f"Message: Error parsing email in get_email helper function with uid: {uid}",
                exc_info=(type(ex), ex, ex.__traceback__)
            )
            return None

class EmailImapService:
    """
        Pass an email and gmail_access_token from login, the service will connect  IMAP client through "imap.gmail.com" 
        so you can get the emails, the login using ouath2_login
    """
    def __init__(self, email, access_token, emails_host="imap.gmail.com"):
        self.email = email
        self.access_token = access_token
        self.max_workers = 5
        self.host = emails_host

        self.imap_client = None
        self.count =0
        self._connect()

    def _connect(self):
        """Connect to IMAP service using host and access_token provided in init"""
        if settings.is_prod:
            raise InfrastructureError(
                "In GmailImapService, You should upload your certificate. ",
                priority=1,
                layer=INFRA_ERROR_LAYERS.ENV_CONFIGURATION
            )
        try:
            context = ssl.create_default_context()
            context.check_hostname  = False
            context.verify_mode = ssl.CERT_NONE
            self.imap_client = IMAPClient(self.host, ssl=True, ssl_context=context)
            self.imap_client.oauth2_login(self.email, self.access_token)
            self.imap_client.select_folder("INBOX")
            status = self.imap_client.folder_status("INBOX", ["MESSAGES"])
            self.count = status[b"MESSAGES"]
        except Exception as e:
            raise InfrastructureError(
                f"In EmailImapService, Error connecting to IMAP server host {self.host}. Please try again ",
                priority=3,
                ex=e,
                layer=INFRA_ERROR_LAYERS.IMAP
            )

    def get_all_inbox_ids(self) -> list[int]:
        """Get all inbox uids"""
        try:
            uids = self.imap_client.search(["ALL"])
            if not uids:
                return []
            return uids
        except Exception as e:
            raise InfrastructureError(
                "In EmailImapService, Error fetching UIDs. Please try again! ",
                priority=3,
                ex=e,
                layer=INFRA_ERROR_LAYERS.IMAP
            )
    def get_criteria_ids(self, 
                         criteria: InboxCriteria, 
                         page_num: int = None, 
                         num_rows: int = None, 
                         all:bool = False
                        ) -> tuple[list[int], int]:
        """Returned paginated uids, total_count of all uids based on criteria. If all = False (default), you should specify page_num and num_rows"""

        if all == False and  (num_rows is None or page_num is None):
            raise InfrastructureError(
                "In EmailImapService, page_num and num_rows must be provided if all is False. ",
                priority=2,
                layer=INFRA_ERROR_LAYERS.IMAP
            )



        sender_email = criteria.sender_email
        subject = criteria.subject
        date_from = criteria.date_from
        date_to = criteria.date_to
        only_unseen = criteria.only_unseen
        search_params = []
        if sender_email is not None and sender_email.strip():
            search_params.extend(['FROM', sender_email])
        if subject is not None and subject.strip():
            search_params.extend(['SUBJECT', subject])
        if date_from is not None and date_from.strip():
            dt = datetime.strptime(date_from, "%Y-%m-%d")
            search_params.extend(['SINCE', dt])
        if date_to is not None and date_to.strip():
            dt = datetime.strptime(date_to, "%Y-%m-%d")
            search_params.extend(['BEFORE', dt])
        if only_unseen:
            search_params.append('UNSEEN')

        if not search_params:
            search_params.append('ALL')

        try:
            uids = list(self.imap_client.search(search_params))
        except Exception as ex:
            raise InfrastructureError(
                "Error fetching uids from criteria, please try again later! ",
                priority=3,
                ex=ex,
                layer=INFRA_ERROR_LAYERS.IMAP
            )

        if not uids:
            return [], 0

        normalized_sort = (criteria.sort_by or "newest_first").strip().lower()
        if normalized_sort == "sender_name":
            senders = self.get_senders_from_uids(uids)
            uids = EmailParsingHelper._sort_uids_senders(uids, senders)
        elif normalized_sort == "oldest_first":
            dates = self.get_dates_from_uids(uids)
            uids = EmailParsingHelper._sort_uids_dates(uids, dates, reverse=False)
        else:
            dates = self.get_dates_from_uids(uids)
            uids = EmailParsingHelper._sort_uids_dates(uids, dates, reverse=True)
        total_count = len(uids)

        if all:
            return uids, total_count

        start = (page_num - 1) * num_rows
        end = start + num_rows
        paged_uids = uids[start:end]

        return paged_uids, total_count

    def get_dates_from_uids(self, uids: list[int]) -> list[datetime]:
        """Search imap inbox for the uids, and return the dates """
        if not uids:
            return []

        dates = []
        batch_size = 200
        try:
            for start in range(0, len(uids), batch_size):
                end = min(start + batch_size, len(uids))
                batch_uids = uids[start:end]
                data = self.imap_client.fetch(batch_uids, ['INTERNALDATE'])

                for uid in batch_uids:
                    row = data.get(uid, {})
                    dt = row.get(b'INTERNALDATE') or row.get('INTERNALDATE')
                    dates.append(dt)
            return dates
        except Exception as ex:
            raise InfrastructureError(
                "In EmailImapService, Error fetching dates from uids.",
                priority=2,
                ex=ex,
                layer=INFRA_ERROR_LAYERS.IMAP
            )

    def get_senders_from_uids(self, uids: list[int]) -> list[str]:
        """Search imap inbox for the uids, and return the sender emails """
        
        if not uids:
            return []

        senders = []
        batch_size = 200
        try:
            for start in range(0, len(uids), batch_size):
                end = min(start + batch_size, len(uids))
                batch_uids = uids[start:end]
                data = self.imap_client.fetch(batch_uids, ['RFC822.HEADER'])

                for uid in batch_uids:
                    row = data.get(uid, {})
                    raw_header = row.get(b'RFC822.HEADER') or row.get('RFC822.HEADER')
                    if not raw_header:
                        senders.append("")
                        continue
                    meta = email.message_from_bytes(raw_header)
                    _, sender_email, _ = EmailParsingHelper.decode_sender(meta.get("From"))
                    senders.append(sender_email or "")
            return senders
        except Exception as ex:
            raise InfrastructureError(
                "In EmailImapService, Error fetching senders from uids.",
                priority=2,
                ex=ex,
                layer=INFRA_ERROR_LAYERS.IMAP
            )


    def get_meta_from_ids(self, uids) -> InboxMeta:
        """Fetch metadata of uids. Returns{senders_names, senders_emails, subjects, min_date, max_date}"""
        senders_emails = dict()
        subjects = set()
        senders_counts = defaultdict(int)
        dates = []
        batch_size = 200
        try:
            for start in range(0, len(uids), batch_size):
                end = min(start + batch_size, len(uids))
                batch_ids = uids[start:end]
                data = self.imap_client.fetch(batch_ids, ['RFC822.HEADER'])

                with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
                    futures = [
                        executor.submit(EmailParsingHelper.get_header_meta , d[b'RFC822.HEADER'])
                        for _, d in data.items()
                    ]
                    for future in as_completed(futures):
                        meta = future.result()
                        if meta is None:
                            continue
                        sender_signature, sender_email, subject, date = meta.sender_signature, meta.sender_email, meta.subject, meta.date
                        if sender_email:
                            senders_emails[sender_email] = sender_signature
                        if subject:
                            subjects.add(subject)
                        if date:
                            dates.append(date)
                        if sender_signature not in senders_counts:
                            senders_counts[sender_signature] =0 
                        senders_counts[sender_signature] += 1

            senders_emails = dict(sorted(senders_emails.items(), key=lambda item: item[1], reverse=True))
            # calculate top senders
            counts = list(senders_counts.values())
            threshold = np.percentile(counts, 85)
            top_senders = {name: count for name, count in senders_counts.items() if count >= threshold}
            top_senders = dict(sorted(top_senders.items(), key=lambda item: item[1], reverse=True))
            return InboxMeta(
                senders_emails=senders_emails,
                subjects= sorted(list(subjects)),
                min_date=str(max(dates)),
                max_date=str(min(dates)),
                top_senders=top_senders
            )
        except Exception as ex:
            raise InfrastructureError(
                "In EmailImapService, Error fetching inbox metadata. ",
                priority=1,
                ex=ex,
                layer=INFRA_ERROR_LAYERS.IMAP
            )

    def get_emails_from_ids(self, uids) -> list[Email]:
        """Get full emails list from uids. Returning list Email """
        all_emails = []
        batch_size  = 100
        for start in range(0, len(uids), batch_size):
            end = min(start + batch_size, len(uids))
            batch_uids = uids[start: end]
            data = self.imap_client.fetch(batch_uids, ['RFC822', 'FLAGS'])
            with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
                futures_by_uid = {
                    uid: executor.submit(
                        EmailParsingHelper.get_email,
                        data[uid][b'RFC822'],
                        uid,
                        data[uid].get(b'FLAGS') or data[uid].get('FLAGS') or (),
                    )
                    for uid in batch_uids
                    if uid in data and b'RFC822' in data[uid]
                }
                for uid in batch_uids:
                    future = futures_by_uid.get(uid)
                    if future is None:
                        continue
                    parsed_email = future.result()
                    if parsed_email is None:
                        continue
                    all_emails.append(parsed_email)
        return all_emails

    def get_html_content_from_id(self, uid: int) -> str:
        """From email_id,  returns the html content of the email"""
        try:
            data = self.imap_client.fetch([uid], ['RFC822'])
            row = data.get(uid, {})
            raw_mail = row.get(b'RFC822') or row.get('RFC822')
            if not raw_mail:
                return ""

            raw = email.message_from_bytes(raw_mail)
            _, _, content_html, _ = EmailParsingHelper.parse_mail_content(raw)
            return content_html
        except Exception as ex:
            raise InfrastructureError(
                f"In EmailImapService, Error fetching html content from email id {uid}.",
                priority=2,
                ex=ex,
                layer=INFRA_ERROR_LAYERS.IMAP
            )
