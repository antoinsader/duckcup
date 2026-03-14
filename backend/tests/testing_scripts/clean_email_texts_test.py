import re
import regex
from bs4 import BeautifulSoup

from infrastructure.email.email_imap_service import EmailParsingHelper




# _BRACE_PATTERN = re.compile(r"<[^>]*>|\[[^\]]*\]|\{[^\}]*\}")
# _URL_PATTERN = re.compile(r"http\S+|www\.\S+")
# _DOLLAR_PATTERN = re.compile(r"\$\w+")
# NON_ASCI_PATTERN= re.compile(r"[^\x20-\x7E]")
# _IMG_PATTERN = re.compile(r'\[Image\s*:?\s*"[^"]+"\]|\[image:[^\]]+\]|\[cid:[^\]]+\]', re.IGNORECASE)
# REPEATED_STRANGE_CHARS = re.compile(r"(.)\1{4,}")
# MULTIPLE_WHITE_SPACES_PATTERN = re.compile(r"\s+")
# _PHONE_LINE_PATTERN = re.compile(r"(?i)\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b")
# _EMPTY_PARENS_PATTERN = re.compile(r"\(\s*\)")
# _FOOTER_KEYWORDS_PATTERN = re.compile(
#     r"(?i)\b(about us|help center|privacy policy|affiliate program|unsubscribe|manage preferences|"
#     r"view in browser|terms( of service)?|contact us)\b"
# )



# def _strip_footer_lines(text: str) -> str:
#     if not text:
#         return ""

#     # Keep original behavior, but avoid O(n) pop(0)
#     lines = [ln.strip() for ln in text.splitlines()]
#     if not lines:
#         return ""

#     start = 0
#     end = len(lines) - 1

#     while start <= end and not lines[start]:
#         start += 1
#     while end >= start and not lines[end]:
#         end -= 1
#     if start > end:
#         return ""

#     i = end
#     while i >= start:
#         line = lines[i]
#         low = line.lower()

#         if (
#             not line
#             or _FOOTER_KEYWORDS_PATTERN.search(line)
#             or low.startswith("unsubscribe")
#             or low.startswith("manage preferences")
#             or _PHONE_LINE_PATTERN.search(line)
#         ):
#             i -= 1
#             continue
#         break

#     return "\n".join(lines[start : i + 1]).strip()

# def clean_mail_text(text):
#     if not text:
#         return ""

#     # Fast path: only parse HTML when it looks like HTML
#     if "<" in text and ">" in text:
#         soup = BeautifulSoup(text, "html.parser")
#         for element in soup(["script", "style", "meta", "noscript", "head", "title", "img"]):
#             element.decompose()
#         text = soup.get_text(separator="\n")

#     text = _strip_footer_lines(text)

#     # Run regex only when relevant markers exist
#     if "[" in text:
#         text = _IMG_PATTERN.sub(" ", text)
#         text = _BRACE_PATTERN.sub(" ", text)
#     if "http" in text or "www." in text:
#         text = _URL_PATTERN.sub("", text)
#     if "(" in text:
#         text = _EMPTY_PARENS_PATTERN.sub(" ", text)
#     if "$" in text:
#         text = _DOLLAR_PATTERN.sub(" ", text)

#     text = NON_ASCI_PATTERN.sub(" ", text)
#     text = regex.sub(r"\p{So}", " ", text)
#     text = REPEATED_STRANGE_CHARS.sub(" ", text)
#     text = MULTIPLE_WHITE_SPACES_PATTERN.sub(" ", text).strip()
#     return text.strip()

def main():
    text = """
    HeyGen Register Join HeyGen CEO's 
    live AMA on our 2026 product roadmap Hi Sader, 
    AI video is evolving fast, but where is it actually headed in 2026? 
    Join HeyGen's Co-Founder & CEO for a live, executive AMA exploring how AI video is 
    transforming the way teams build, scale, 
    and localize content. In this audience-driven session, you'll get a candid look at the
    strategic thinking behind our 2026 roadmap. You'll hear insights on: Where AI video
    generation and translation are headed this year How we evaluate new features and product bets What
    enterprises should consider when adopting AI video at scale Bring your questions. 
    Leave with clarity on what's next. 
    Save your spot Best, HeyGen Webinars Looking for past recordings? 
    Visit our Community HeyGen Discord YouTube X LinkedIn Facebook About Us | Help Center | Privacy Policy | Unsubscribe 12130 Millennium Drive, Suite 300, Los Angeles, CA 90094
    """
    # cleaned = clean_mail_text(text)
    # # print(cleaned)
    cleaned = EmailParsingHelper.clean_mail_text(text)
    print(cleaned)
    
