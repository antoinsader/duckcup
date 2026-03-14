import { useMemo } from "react";

import Button from "../reusable/Button/Button";
import Popup from "../reusable/Popup/Popup";

import styles from "./RowDetailsPopup.module.scss";

const get_label_value = (key_value) => {
  const normalized_value = String(key_value || "").trim();
  if (!normalized_value) return "-";

  return normalized_value
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char_value) => char_value.toUpperCase());
};

const get_text_value = (raw_value) => {
  if (raw_value === null || raw_value === undefined) return "-";

  if (typeof raw_value === "string") {
    const normalized_value = raw_value.trim();
    return normalized_value || "-";
  }

  if (typeof raw_value === "number") return String(raw_value);
  if (typeof raw_value === "boolean") return raw_value ? "true" : "false";

  if (Array.isArray(raw_value)) {
    if (!raw_value.length) return "-";
    return raw_value
      .map((item_value) => (typeof item_value === "object" ? JSON.stringify(item_value) : String(item_value)))
      .join(", ");
  }

  try {
    return JSON.stringify(raw_value, null, 2);
  } catch (ex) {
    return String(raw_value);
  }
};

const is_long_content_value = (entry_value) => {
  const normalized_key = String(entry_value?.key || "").toLowerCase();
  const normalized_value = String(entry_value?.value || "");

  if (normalized_value.length > 180) return true;

  return ["text", "content", "html", "body", "caption"].some((token_value) =>
    normalized_key.includes(token_value)
  );
};

export default function RowDetailsPopup({
  is_visible = false,
  close_popup,
  title = "Details",
  row_data,
  extra_content = null,
}) {
  const row_entries = useMemo(() => {
    if (!row_data || typeof row_data !== "object") return [];

    return Object.entries(row_data).map(([key_value, raw_value]) => ({
      key: key_value,
      label: get_label_value(key_value),
      value: get_text_value(raw_value),
    }));
  }, [row_data]);

  const short_entries = useMemo(() => {
    return row_entries.filter((entry_value) => !is_long_content_value(entry_value));
  }, [row_entries]);

  const long_entries = useMemo(() => {
    return row_entries.filter((entry_value) => is_long_content_value(entry_value));
  }, [row_entries]);

  return (
    <Popup
      title={title}
      isVisible={is_visible}
      closePopup={close_popup}
      popupContainerStyle={{ width: "min(920px, 96%)", maxWidth: "96vw", maxHeight: "88vh" }}
    >
      <div className={styles.details_root}>
        <div className={styles.details_card}>
          <div className={styles.meta_grid}>
            {short_entries.length ? (
              short_entries.map((entry_value) => (
                <div key={entry_value.key} className={styles.meta_item}>
                  <span className={styles.meta_label}>{entry_value.label}</span>
                  <span className={styles.meta_value}>{entry_value.value}</span>
                </div>
              ))
            ) : (
              <div className={styles.meta_item}>
                <span className={styles.meta_label}>Info</span>
                <span className={styles.meta_value}>No fields available.</span>
              </div>
            )}
          </div>

          {long_entries.map((entry_value) => (
            <div key={`long_${entry_value.key}`} className={styles.content_block}>
              <span className={styles.meta_label}>{entry_value.label}</span>
              <p className={styles.content_value}>{entry_value.value}</p>
            </div>
          ))}

          {extra_content ? <div className={styles.extra_content_root}>{extra_content}</div> : null}
        </div>

        <div className={styles.buttons_row}>
          <Button variant="secondary" onClick={close_popup}>
            Close
          </Button>
        </div>
      </div>
    </Popup>
  );
}