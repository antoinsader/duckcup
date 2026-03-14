from infrastructure.email.email_imap_service import EmailParsingHelper


text = "=?UTF-8?B?IOKaoO+4j1lvdXIgR29vZ2xlIE9uZSBzdG9yYWdlIGlzIDcxJSBmdWxs?="


def main():
    cleaned = EmailParsingHelper.clean_mail_text(text)
    print(f"cleaned: {cleaned}")