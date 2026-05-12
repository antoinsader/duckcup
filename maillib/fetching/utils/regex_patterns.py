import re


class RegexPatterns:
    """Compiled regex patterns"""
    BRACE_PATTERN = re.compile(r"<[^>]*>|\[[^\]]*\]|\{[^\}]*\}")
    URL_PATTERN = re.compile(r"http\S+|www\.\S+")
    DOLLAR_PATTERN = re.compile(r"\$\w+")
    NON_ASCI_PATTERN= re.compile(r"[^\x20-\x7E\n]")
    IMG_PATTERN = re.compile(r'\[Image\s*:?\s*"[^"]+"\]|\[image:[^\]]+\]|\[cid:[^\]]+\]', re.IGNORECASE)
    REPEATED_STRANGE_CHARS = re.compile(r"(.)\1{4,}")
    MULTIPLE_WHITE_SPACES_PATTERN = re.compile(r"[^\S\n]+")
    MULTIPLE_NEWLINES_PATTERN = re.compile(r"\n{3,}")
    PHONE_LINE_PATTERN = re.compile(r"(?i)\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b")
    EMPTY_PARENS_PATTERN = re.compile(r"\(\s*\)")
    FOOTER_KEYWORDS_PATTERN = re.compile(
        r"(?i)\b(about us|help center|privacy policy|affiliate program|unsubscribe|manage preferences|"
        r"view in browser|terms( of service)?|contact us|linkedin|facebook|discord)\b|(?<!\w)x(?!\w)"
    )
    ADDRESS_LINE_PATTERN = re.compile(
        r"(?i)^\s*\d{1,6}\s+[\w .,'-]+\b(?:street|st|avenue|ave|road|rd|drive|dr|boulevard|blvd|lane|ln|"
        r"suite|ste|floor|fl|way|place|pl|court|ct|parkway|pkwy)\b[\w .,'-]*,\s*[A-Za-z .'-]+,\s*"
        r"[A-Z]{2}\s+\d{5}(?:-\d{4})?\s*$"
    )

