import { apiRequest } from "../api/api";

export const get_inbox_meta = async (account_id) => {
  // Return  senders_emails : dict {sender_email: sender_signature}, subjects : list[str], min_date : str, max_date : str, top_senders: dict
  const user_accounts = await apiRequest({
    route: "email/get_inbox_meta",
    body: { account_id: account_id },
  });
  return user_accounts;
};


export const get_account_email_html = async (account_id, email_id) => {
  // Return str
  const email_html = await apiRequest({
    route: "email/get_html_content",
    body: { account_id: account_id, email_id: email_id },
  });
  return email_html;
};



export const get_emails_by_criteria = async (
  account_id,
  criteria,
  page_num = 1,
  num_rows = 50,
) => {
  /**
  * List of:
      gmail_id: str
      subject: str
      sender_signature: str
      sender_email: str
      date: str
      content_clean : str
      content_html : str
      contains_attachement: bool
      language: str

  */

  const user_accounts = await apiRequest({
    route: "email/get_inbox_criteria",
    body: {
      account_id: account_id,
      criteria,
      page_num,
      num_rows: num_rows === "ALL" ? undefined : num_rows,
      all: num_rows === "ALL" ? true : false,
    },
  });
  return user_accounts;
};
