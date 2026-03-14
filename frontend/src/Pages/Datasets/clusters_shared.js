export const ALGORITHM_OPTIONS = [
  {
    id: "tokens_kmeans",
    label: "tokens_kmeans",
  },
  {
    id: "sematics_kmeans",
    label: "sematics_kmeans",
  },
  {
    id: "lda",
    label: "lda",
  },
  {
    id: "advanced",
    label: "advanced",
  },
];

export const DEFAULT_ALGORITHM_TYPE = "advanced";
export const DEFAULT_K_CLUSTERS = "4";

export const is_valid_positive_int = (value) => {
  const number_value = Number(value);
  return Number.isInteger(number_value) && number_value > 0;
};

export const has_value = (value) => {
  return value !== undefined && value !== null && String(value).trim() !== "";
};

export const build_message_preview = (doc_row, is_telegram_dataset) => {
  if (!doc_row || typeof doc_row !== "object") {
    return {
      title: "Message",
      subtitle: "",
      text: "-",
    };
  }

  if (is_telegram_dataset) {
    return {
      title:
        doc_row?.entity_name ||
        doc_row?.sender_username ||
        doc_row?.entity_id ||
        doc_row?.message_id ||
        "Telegram message",
      subtitle: doc_row?.message_date || "",
      text: doc_row?.message_text || doc_row?.message_clean_text || "-",
    };
  }

  return {
    title:
      doc_row?.subject ||
      doc_row?.sender ||
      doc_row?.from ||
      doc_row?.email_id ||
      "Email",
    subtitle:
      doc_row?.date || doc_row?.received_date || doc_row?.sent_date || "",
    text:
      doc_row?.body_text ||
      doc_row?.clean_text ||
      doc_row?.snippet ||
      doc_row?.text ||
      "-",
  };
};