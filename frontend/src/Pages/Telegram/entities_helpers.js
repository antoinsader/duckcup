export const ANALYSIS_TYPES_LIMIT = 5;
export const ANALYSIS_VALUES_LIMIT = 5;
export const DATE_FILTER_PRESETS = [
  {
    id: "last_hour",
    label: "Last hour",
  },
  {
    id: "last_3_hours",
    label: "Last 3 hours",
  },
  {
    id: "last_12_hours",
    label: "Last 12 hours",
  },
  {
    id: "today",
    label: "Today",
  },
  {
    id: "yesterday",
    label: "Yesterday",
  },
  {
    id: "last_week",
    label: "Last week",
  },
  {
    id: "last_3_weeks",
    label: "Last 3 weeks",
  },
  {
    id: "last_month",
    label: "Last month",
  },
  {
    id: "last_6_months",
    label: "Last 6 months",
  },
  {
    id: "last_year",
    label: "Last year",
  },
];

export const is_date_in_filter_preset = (row_date_value, filter_preset_id) => {
  const row_timestamp = new Date(row_date_value).getTime();
  if (Number.isNaN(row_timestamp)) return false;

  const now_date = new Date();
  const now_timestamp = now_date.getTime();
  const start_today = new Date(
    now_date.getFullYear(),
    now_date.getMonth(),
    now_date.getDate(),
  );
  const start_yesterday = new Date(start_today);
  start_yesterday.setDate(start_today.getDate() - 1);
  const start_last_week = new Date(now_date);
  start_last_week.setDate(now_date.getDate() - 7);
  const start_last_3_weeks = new Date(now_date);
  start_last_3_weeks.setDate(now_date.getDate() - 21);
  const start_last_month = new Date(now_date);
  start_last_month.setMonth(now_date.getMonth() - 1);
  const start_last_6_months = new Date(now_date);
  start_last_6_months.setMonth(now_date.getMonth() - 6);
  const start_last_year = new Date(now_date);
  start_last_year.setFullYear(now_date.getFullYear() - 1);

  switch (filter_preset_id) {
    case "last_hour":
      return row_timestamp >= now_timestamp - 60 * 60 * 1000;
    case "last_3_hours":
      return row_timestamp >= now_timestamp - 3 * 60 * 60 * 1000;
    case "last_12_hours":
      return row_timestamp >= now_timestamp - 12 * 60 * 60 * 1000;
    case "today":
      return row_timestamp >= start_today.getTime();
    case "yesterday":
      return (
        row_timestamp >= start_yesterday.getTime() &&
        row_timestamp < start_today.getTime()
      );
    case "last_week":
      return (
        row_timestamp >= start_last_week.getTime() &&
        row_timestamp <= now_timestamp
      );
    case "last_3_weeks":
      return (
        row_timestamp >= start_last_3_weeks.getTime() &&
        row_timestamp <= now_timestamp
      );
    case "last_month":
      return (
        row_timestamp >= start_last_month.getTime() &&
        row_timestamp <= now_timestamp
      );
    case "last_6_months":
      return (
        row_timestamp >= start_last_6_months.getTime() &&
        row_timestamp <= now_timestamp
      );
    case "last_year":
      return (
        row_timestamp >= start_last_year.getTime() &&
        row_timestamp <= now_timestamp
      );
    default:
      return false;
  }
};


const has_valid_value = (value) => {
  return value !== undefined && value !== null && String(value) !== "";
};

const build_start_of_day_timestamp = (date_value) => {
  if (!has_valid_value(date_value)) return null;

  const parsed_date = new Date(`${String(date_value)}T00:00:00`);
  const parsed_timestamp = parsed_date.getTime();
  if (Number.isNaN(parsed_timestamp)) return null;
  return parsed_timestamp;
};

const build_end_of_day_timestamp = (date_value) => {
  if (!has_valid_value(date_value)) return null;

  const parsed_date = new Date(`${String(date_value)}T23:59:59.999`);
  const parsed_timestamp = parsed_date.getTime();
  if (Number.isNaN(parsed_timestamp)) return null;
  return parsed_timestamp;
};

export const is_row_in_specific_date_range = (date, start_date_value, end_date_value) => {
      if (!date) return true;
      const row_timestamp = new Date(date).getTime();
      if (Number.isNaN(row_timestamp)) return false;
      

      const start_timestamp = build_start_of_day_timestamp(start_date_value);
      const end_timestamp = build_end_of_day_timestamp(end_date_value);


      if (start_timestamp !== null && row_timestamp < start_timestamp) {
        return false;
      }

      if (end_timestamp !== null && row_timestamp > end_timestamp) {
        return false;
      }
      return true;



  }

export const build_sidebar_entity_id = (account_id, entity_id) => {
  return `${String(account_id)}::${String(entity_id)}`;
};

export const get_account_default_open_item_ids = (messaging_accounts_data) => {
  const first_account_id = messaging_accounts_data?.[0]?.account_id;
  if (!first_account_id) return [];
  return [first_account_id];
};

export const parse_sidebar_child_id = (sidebar_child_id) => {
  const [account_id = "", entity_id = ""] = String(
    sidebar_child_id || "",
  ).split("::");
  return {
    account_id,
    entity_id,
  };
};

export const normalize_message_id = (message_id) => {
  return String(message_id ?? "").trim();
};

export const build_analysis_chip_id = (entity_label, entity_text) => {
  return `${String(entity_label)}::${String(entity_text)}`;
};

export const build_scoped_message_id = (sidebar_entity_id, message_id) => {
  return `${String(sidebar_entity_id)}::${normalize_message_id(message_id)}`;
};


export const get_messages_columns  = () => ([
   {
          field: "message_id",
          label: "Message id",
          hide: true,
        },
        {
          field: "date",
          label: "Date",
          type: "datetime",
          search_visible: true,
        },
        {
          field: "sender_username",
          label: "Sender username",
          search_visible: true,
        },
        {
          field: "text",
          label: "Text",
          search_visible: true,
          type: "part",
        },
        {
          field: "views",
          label: "Views",
        },
        {
          field: "forwards",
          label: "Forwards",
        },
        {
          field: "media",
          label: "Media",
          format: (value) => (value ? "Yes" : "No"),
        },
]);