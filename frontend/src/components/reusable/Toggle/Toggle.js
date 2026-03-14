import React from "react";

import styles from "./Toggle.module.scss";

export default function Toggle({
  checked = false,
  on_change,
  label,
  disabled = false,
  id,
}) {
  return (
    <label className={styles.toggle_root} htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className={styles.toggle_input}
        checked={checked}
        disabled={disabled}
        onChange={(event) => on_change?.(event.target.checked)}
      />
      <span className={styles.toggle_slider} aria-hidden="true" />
      {label ? <span className={styles.toggle_label}>{label}</span> : null}
    </label>
  );
}
