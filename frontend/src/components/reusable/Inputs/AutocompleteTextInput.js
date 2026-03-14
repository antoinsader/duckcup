import { useDeferredValue, useMemo, useState } from "react";
import styles from "./AutocompleteTextInput.module.scss";

const MAX_AUTOCOMPLETE_ITEMS = 120;

const normalizeOptions = (options_list) => {
  if (!Array.isArray(options_list)) return [];

  const unique_values = new Set();
  options_list.forEach((item_value) => {
    const normalized_value = String(item_value ?? "").trim();
    if (normalized_value) {
      unique_values.add(normalized_value);
    }
  });

  return [...unique_values];
};

export default function AutocompleteTextInput({
  label,
  value,
  onChange,
  options,
  autocomplete_loading,
  placeholder,
}) {
  const [is_open, set_is_open] = useState(false);
  const [active_index, set_active_index] = useState(-1);

  const deferred_query = useDeferredValue(value || "");

  const normalized_options = useMemo(() => normalizeOptions(options), [options]);

  const filtered_options = useMemo(() => {
    if (!deferred_query) {
      return normalized_options.slice(0, MAX_AUTOCOMPLETE_ITEMS);
    }

    const lower_query = deferred_query.toLowerCase();
    const next_options = [];

    for (let i = 0; i < normalized_options.length; i += 1) {
      const candidate = normalized_options[i];
      if (candidate.toLowerCase().includes(lower_query)) {
        next_options.push(candidate);
      }
      if (next_options.length >= MAX_AUTOCOMPLETE_ITEMS) {
        break;
      }
    }

    return next_options;
  }, [normalized_options, deferred_query]);

  const has_more_matches =
    normalized_options.length > MAX_AUTOCOMPLETE_ITEMS &&
    filtered_options.length === MAX_AUTOCOMPLETE_ITEMS;

  const handle_input_change = (event) => {
    onChange(event.target.value);
    set_is_open(true);
    set_active_index(-1);
  };

  const select_option = (next_value) => {
    onChange(next_value);
    set_is_open(false);
    set_active_index(-1);
  };

  const handle_key_down = (event) => {
    if (!is_open) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      set_active_index((prev_index) => {
        const next_index = prev_index + 1;
        return next_index >= filtered_options.length ? 0 : next_index;
      });
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      set_active_index((prev_index) => {
        if (prev_index <= 0) return filtered_options.length - 1;
        return prev_index - 1;
      });
      return;
    }

    if (event.key === "Enter" && active_index >= 0) {
      event.preventDefault();
      const selected_value = filtered_options[active_index];
      if (selected_value) {
        select_option(selected_value);
      }
      return;
    }

    if (event.key === "Escape") {
      set_is_open(false);
      set_active_index(-1);
    }
  };

  return (
    <div className={styles.field_col}>
      <label className={styles.field_label}>{label}</label>
      <div className={styles.input_shell}>
        <input
          type="text"
          value={value || ""}
          onChange={handle_input_change}
          onFocus={() => set_is_open(true)}
          onBlur={() => {
            setTimeout(() => {
              set_is_open(false);
              set_active_index(-1);
            }, 120);
          }}
          onKeyDown={handle_key_down}
          className={styles.field_input}
          placeholder={placeholder}
        />

        {autocomplete_loading ? <span className={styles.input_spinner} /> : null}
      </div>

      {is_open ? (
        <div className={styles.dropdown_panel}>
          {filtered_options.length ? (
            <>
              <ul className={styles.options_list}>
                {filtered_options.map((option_value, index_value) => (
                  <li
                    key={`${option_value}-${index_value}`}
                    className={`${styles.option_item} ${
                      active_index === index_value ? styles.option_item_active : ""
                    }`}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      select_option(option_value);
                    }}
                  >
                    {option_value}
                  </li>
                ))}
              </ul>

              {has_more_matches ? (
                <div className={styles.options_hint}>
                  Showing first {MAX_AUTOCOMPLETE_ITEMS} matches. Keep typing to narrow down.
                </div>
              ) : null}
            </>
          ) : (
            <div className={styles.options_empty}>No matches</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
