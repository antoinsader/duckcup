import React, { useEffect, useMemo, useRef, useState } from "react";

import styles from "./RichSelect.module.scss";

const has_value = (value) => {
  return value !== undefined && value !== null && String(value).trim() !== "";
};

export default function RichSelect({
  label,
  value,
  options = [],
  disabled,
  onChange,
  placeholder = "Select option",
  unavailable_hover_text = "This model is not available on the server",
  compact = false,
}) {
  const container_ref = useRef(null);
  const [is_open, set_is_open] = useState(false);
  const [hovered_unavailable_id, set_hovered_unavailable_id] = useState(null);

  const selected_option = useMemo(() => {
    return options.find((option_row) => String(option_row?.id) === String(value));
  }, [options, value]);

  useEffect(() => {
    const handle_click_outside = (event) => {
      if (!container_ref.current?.contains(event.target)) {
        set_is_open(false);
        set_hovered_unavailable_id(null);
      }
    };

    document.addEventListener("mousedown", handle_click_outside);

    return () => {
      document.removeEventListener("mousedown", handle_click_outside);
    };
  }, []);

  const toggle_open = () => {
    if (disabled) return;
    set_is_open((prev_state) => !prev_state);
  };

  const handle_option_click = (option_row) => {
    if (!option_row?.is_available) {
      return;
    }

    onChange?.(option_row?.id);
    set_is_open(false);
    set_hovered_unavailable_id(null);
  };

  return (
    <div
      className={`${styles.select_root} ${compact ? styles.compact : ""}`}
      ref={container_ref}
    >
      {label && <label className={styles.input_label}>{label}</label>}

      <button
        type="button"
        className={styles.select_trigger}
        onClick={toggle_open}
        disabled={disabled}
      >
        <div className={styles.trigger_texts}>
          <span className={styles.trigger_title}>
            {selected_option?.label || placeholder}
          </span>
          {!compact && has_value(selected_option?.description) && (
            <span className={styles.trigger_subtitle}>
              {selected_option.description}
            </span>
          )}
        </div>
        <span className={styles.trigger_icon}>{is_open ? "▲" : "▼"}</span>
      </button>

      {is_open && (
        <div className={styles.options_popover}>
          {options.map((option_row) => {
            const is_selected = String(option_row?.id) === String(value);
            const is_unavailable = !option_row?.is_available;

            return (
              <div
                key={`rich-option-${option_row?.id}`}
                className={`${styles.option_item} ${
                  is_selected ? styles.option_selected : ""
                } ${is_unavailable ? styles.option_disabled : ""}`}
                onClick={() => handle_option_click(option_row)}
                onMouseEnter={() => {
                  if (is_unavailable) {
                    set_hovered_unavailable_id(option_row?.id);
                  }
                }}
                onMouseLeave={() => {
                  if (is_unavailable) {
                    set_hovered_unavailable_id(null);
                  }
                }}
              >
                <div className={styles.option_title}>{option_row?.label}</div>
                {has_value(option_row?.description) && (
                  <div className={styles.option_subtitle}>{option_row.description}</div>
                )}

                {is_unavailable &&
                  hovered_unavailable_id === option_row?.id && (
                    <div className={styles.option_hint}>
                      {unavailable_hover_text}
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
