import { useId, useState } from "react";
import styles from "./Section.module.scss";

export default function Section({
  section_header,
  section_content,
  default_open = true,
  is_open_external,
  on_toggle,
  content_class_name = "",
  content_style,
}) {
  const [is_open, set_is_open] = useState(default_open);
  const content_id = useId();
  const is_controlled = is_open_external !== undefined;
  const is_open_value = is_controlled ? Boolean(is_open_external) : is_open;

  const handle_toggle_click = () => {
    const next_state = !is_open_value;

    if (!is_controlled) {
      set_is_open(next_state);
    }

    on_toggle?.(next_state);
  };

  return (
    <section
      className={`${styles.section_root} ${
        is_open_value ? styles.section_open : styles.section_closed
      }`}
    >
      <button
        type="button"
        className={styles.section_header}
        onClick={handle_toggle_click}
        aria-expanded={is_open_value}
        aria-controls={content_id}
      >
        <div className={styles.section_header_content}>{section_header}</div>
        <span className={styles.section_icon}>{is_open_value ? "−" : "+"}</span>
      </button>

      <div
        id={content_id}
        className={styles.section_content_wrap}
        style={{ maxHeight: is_open_value ? "1000vh" : "0px" }}
      >
        <div
          className={`${styles.section_content} ${content_class_name}`.trim()}
          style={content_style}
        >
          {section_content}
        </div>
      </div>
    </section>
  );
}