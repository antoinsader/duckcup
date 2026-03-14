export function get_email_columns() {
  return [
    { field: "email_id" },
    { field: "subject", label: "Subject", width: "20%", search_visible: true },
    {
      field: "date",
      label: "Date",
      width: "10%",
      type: "datetime",
      search_visible: true,
    },
    {
      field: "sender_email",
      label: "Sender email",
      width: "10%",
      search_visible: true,
    },
    {
      field: "sender_signature",
      label: "Sender signature",
      width: "10%",
      search_visible: true,
    },
    { field: "flags", label: "Flags", width: "10%", search_visible: true },
    {
      field: "contains_attachement",
      label: "Contains attachement",
      width: "5%",
      search_visible: true,
    },
    {
      field: "content_clean",
      label: "Content",
      type: "part",
      width: "50%",
      search_visible: true,
    },
  ];
}
