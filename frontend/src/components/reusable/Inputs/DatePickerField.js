import styles from "./DatePickerField.module.scss";

export default function DatePickerField({ label, value, onChange, min, max }) {
  return (
    <div className={styles.field_col}>
      <label className={styles.field_label}>{label}</label>
      <div className={styles.input_shell}>
        <input
          type="date"
          className={styles.field_input}
          value={value || ""}
          min={min || undefined}
          max={max || undefined}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  );
}
