import { useMemo, useState } from "react";

import { getFormattedDateTimeValue } from "../../lib/utils/datetime";

import Button from "../reusable/Button/Button";
import Popup from "../reusable/Popup/Popup";

import EmailHtmlPopup from "./EmailHtmlPopup";

import styles from "./EmailContainerPopup.module.scss";



export default function EmailContainerPopup({
  is_visible = false,
  close_popup,
  account_id,
  dataset_id,
  email_row,
}) {
  const [is_html_popup_visible, set_is_html_popup_visible] = useState(false);

  const flags_text = useMemo(() => {
    return Array.isArray(email_row?.flags)
      ? email_row.flags.join(", ")
      : email_row?.flags || "-";
  }, [email_row?.flags]);

  const content_text = useMemo(() => {
    return email_row?.content_clean || "-";
  }, [email_row?.content_clean]);

  const sender_label = useMemo(() => {
    return email_row?.sender_signature || "-";
  }, [email_row?.sender_signature]);

  const sender_email = useMemo(() => {
    return email_row?.sender_email || "-";
  }, [email_row?.sender_email]);

  const date_text = useMemo(() => {
    return getFormattedDateTimeValue(email_row?.date) || "-";
  }, [email_row?.date]);

  const popup_title = useMemo(() => {
    return email_row?.subject || "Email details";
  }, [email_row?.subject]);

  return (
    <>
      <Popup
        title={popup_title}
        isVisible={is_visible}
        closePopup={close_popup}
        popupContainerStyle={{ width: "min(900px, 96%)", maxWidth: "96vw", maxHeight: "88vh" }}
      >
        <div className={styles.email_container_root}>
          <div className={styles.email_summary_card}>
            <div className={styles.meta_grid}>
              <div className={styles.meta_item}>
                <span className={styles.meta_label}>Sender</span>
                <span className={styles.meta_value}>{sender_label}</span>
              </div>

              <div className={styles.meta_item}>
                <span className={styles.meta_label}>Sender Email</span>
                <span className={styles.meta_value}>{sender_email}</span>
              </div>

              <div className={styles.meta_item}>
                <span className={styles.meta_label}>Date</span>
                <span className={styles.meta_value}>{date_text}</span>
              </div>

              <div className={styles.meta_item}>
                <span className={styles.meta_label}>Flags</span>
                <span className={styles.meta_value}>{flags_text}</span>
              </div>
            </div>

            <div className={styles.content_block}>
              <span className={styles.meta_label}>Content</span>
              <p className={styles.content_value}>{content_text}</p>
            </div>
          </div>

          <div className={styles.buttons_row}>


            <Button variant="primary" onClick={() => set_is_html_popup_visible(true)}>
              Show HTML
            </Button>
          </div>
        </div>
      </Popup>

      <EmailHtmlPopup
        is_visible={is_html_popup_visible}
        close_popup={() => set_is_html_popup_visible(false)}
        account_id={account_id}
        dataset_id={dataset_id}
        email_id={email_row?.gmail_id || email_row?.email_id}
      />



    </>
  );
}
