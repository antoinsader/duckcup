export const getFormattedDateTimeValue = (value) => {
  if (!value) return value;

  const parsed_date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed_date.getTime())) return value;

  const day = parsed_date.getDate();
  const month = parsed_date.toLocaleString("en-US", { month: "short" });
  const year = parsed_date.getFullYear();
  const time = parsed_date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${day}/${month}/${year} ${time}`;
};
