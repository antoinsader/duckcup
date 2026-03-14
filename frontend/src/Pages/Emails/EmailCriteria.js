import { useMemo, useState } from "react";
import Button from "../../components/reusable/Button/Button";
import AutocompleteTextInput from "../../components/reusable/Inputs/AutocompleteTextInput";
import DatePickerField from "../../components/reusable/Inputs/DatePickerField";
import styles from "./EmailCriteria.module.scss";

const SORT_BY_OPTIONS = [
  { id: "newest_first", label: "Newest first" },
  { id: "oldest_first", label: "Oldest first" },
  { id: "sender_name", label: "Sender name" },
];

const toDateInputValue = (date_value) => {
  if (!date_value) return "";
  const parsed_date = new Date(date_value);
  if (Number.isNaN(parsed_date.getTime())) return "";

  const year = parsed_date.getFullYear();
  const month = String(parsed_date.getMonth() + 1).padStart(2, "0");
  const day = String(parsed_date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function EmailCriteria({
  meta_data,
  meta_loading,
  get_emails,
  criteria_data,
  set_criteria_data,
}) {
  const [has_pending_criteria_changes, set_has_pending_criteria_changes] =
    useState(false);

  const [criteria_local_data, set_criteria_local_data] = useState(() => ({
    sender_email: "",
    subject: "",
    date_from: "",
    date_to: "",
    sort_by: "newest_first",
    ...(criteria_data || {}),
  }));

  const set_field_value = (field_name, field_value) => {
    set_criteria_local_data((prev_state) => {
      if (prev_state[field_name] === field_value) {
        return prev_state;
      }

      const next_state = {
        ...prev_state,
        [field_name]: field_value,
      };

      set_criteria_data(next_state);
      set_has_pending_criteria_changes(true);
      return next_state;
    });
  };

  const sender_signature_options = useMemo(() => {
    const signatures_values = Object.values(meta_data.senders_emails || {})
      .map((value_item) => String(value_item ?? "").trim())
      .filter(Boolean);
    return [...new Set(signatures_values)];
  }, [meta_data?.senders_emails]);

  const sender_email_by_signature = useMemo(() => {
    const email_by_signature = {};

    Object.entries(meta_data.senders_emails || {}).forEach(
      ([sender_email, sender_signature]) => {
        const normalized_signature = String(sender_signature ?? "").trim();
        if (normalized_signature && !email_by_signature[normalized_signature]) {
          email_by_signature[normalized_signature] = sender_email;
        }
      },
    );

    return email_by_signature;
  }, [meta_data.senders_emails]);

  const min_date = toDateInputValue(meta_data?.min_date);
  const max_date = toDateInputValue(meta_data?.max_date);

  return (
    <div className={styles.criteria_root}>
      <div className={styles.criteria_group}>
        <div className={styles.group_header}>
          <h3 className={styles.group_title}>Filters</h3>
          <p className={styles.group_subtitle}>Narrow down which emails to display.</p>
        </div>

        <div className={styles.criteria_grid}>
          <AutocompleteTextInput
            label="Sender name"
            value={
              meta_data?.senders_emails
                ? meta_data.senders_emails[criteria_local_data.sender_email]
                : ""
            }
            onChange={(next_value) => {
              set_field_value(
                "sender_email",
                sender_email_by_signature[next_value] || "",
              );
            }}
            options={sender_signature_options}
            autocomplete_loading={meta_loading}
            placeholder="Search by sender signature"
          />

          <AutocompleteTextInput
            label="Subject"
            value={criteria_local_data.subject}
            onChange={(next_value) => set_field_value("subject", next_value)}
            options={meta_data?.subjects}
            autocomplete_loading={meta_loading}
            placeholder="Search by email subject"
          />

          <DatePickerField
            label="Date from"
            value={criteria_local_data.date_from}
            onChange={(next_value) => set_field_value("date_from", next_value)}
            min={min_date}
            max={max_date}
          />

          <DatePickerField
            label="Date to"
            value={criteria_local_data.date_to}
            onChange={(next_value) => set_field_value("date_to", next_value)}
            min={min_date}
            max={max_date}
          />
        </div>
      </div>

      <div className={styles.criteria_group}>
        <div className={styles.group_header}>
          <h3 className={styles.group_title}>Sort</h3>
          <p className={styles.group_subtitle}>Choose how results are ordered.</p>
        </div>

        <div className={styles.sort_chips} role="radiogroup" aria-label="Sort emails by">
          {SORT_BY_OPTIONS.map((sort_option) => {
            const is_selected = criteria_local_data.sort_by === sort_option.id;

            return (
              <button
                type="button"
                key={sort_option.id}
                className={`${styles.sort_chip} ${
                  is_selected ? styles.sort_chip_active : ""
                }`}
                onClick={() => set_field_value("sort_by", sort_option.id)}
                aria-pressed={is_selected}
              >
                {sort_option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.criteria_actions}>
        {has_pending_criteria_changes ? (
          <p className={styles.criteria_note}>
            Criteria changed. Press Get emails to apply.
          </p>
        ) : null}

        <Button
          onClick={() => {
            get_emails(criteria_local_data);
            set_has_pending_criteria_changes(false);
          }}
          variant="primary"
        >
          Get emails
        </Button>
      </div>
    </div>
  );
}
