import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./ExtraSideBar.module.scss";

const EMPTY_ARRAY = [];

const is_valid_id = (value) => {
  return value !== null && value !== undefined && String(value).trim() !== "";
};

const normalize_array = (value) => {
  return Array.isArray(value) ? value : EMPTY_ARRAY;
};

const build_item_key = (item, index) => {
  if (is_valid_id(item?.id)) return String(item.id);
  if (is_valid_id(item?.label)) return `${String(item.label)}-${index}`;
  return `item-${index}`;
};

const build_child_key = (item, child, index) => {
  const item_key = is_valid_id(item?.id)
    ? String(item.id)
    : String(item?.label || "item");
  const child_key = is_valid_id(child?.id)
    ? String(child.id)
    : String(child?.title || "child");

  return `${item_key}-${child_key}-${index}`;
};

export default function ExtraSideBar({
  title,
  items,
  on_item_click,
  on_child_click,
  on_collapse_toggle,
  loading = false,
  default_collapsed = false,
  active_item_id_external = null,
  active_child_id_external = null,
  default_open_item_ids = [],
}) {
  const [is_collapsed, set_is_collapsed] = useState(Boolean(default_collapsed));
  const [active_item_id, set_active_item_id] = useState(null);
  const [active_child_id, set_active_child_id] = useState(null);
  const [open_children_map, set_open_children_map] = useState({});

  const normalized_items = useMemo(() => normalize_array(items), [items]);
  const normalized_default_open_item_ids = useMemo(() => {
    return normalize_array(default_open_item_ids).filter(is_valid_id);
  }, [default_open_item_ids]);

  useEffect(() => {
    set_is_collapsed(Boolean(default_collapsed));
  }, [default_collapsed]);

  useEffect(() => {


    if (normalized_default_open_item_ids.length === 0) {
      return;
    }

    set_open_children_map((prev_state) => {
      let has_changes = false;
      const next_state = { ...prev_state };

      normalized_default_open_item_ids.forEach((item_id) => {
        if (!Object.prototype.hasOwnProperty.call(next_state, item_id)) {
          next_state[item_id] = true;
          has_changes = true;
        }
      });

      return has_changes ? next_state : prev_state;
    });
  }, [normalized_default_open_item_ids]);

  useEffect(() => {
    if (active_item_id_external === undefined) return;

    set_active_item_id((prev_state) => {
      return prev_state === active_item_id_external ? prev_state : active_item_id_external;
    });

    if (is_valid_id(active_item_id_external)) {
      set_open_children_map((prev_state) => {
        if (prev_state[active_item_id_external]) {
          return prev_state;
        }

        return {
          ...prev_state,
          [active_item_id_external]: true,
        };
      });
    }
  }, [active_item_id_external]);

  useEffect(() => {
    if (active_child_id_external === undefined) return;
    set_active_child_id((prev_state) => {
      return prev_state === active_child_id_external ? prev_state : active_child_id_external;
    });
  }, [active_child_id_external]);

  const set_collapsed = useCallback(
    (next_collapsed) => {
      set_is_collapsed(next_collapsed);
      on_collapse_toggle?.(next_collapsed);
    },
    [on_collapse_toggle],
  );

  const handle_collapse_click = useCallback(() => {
    set_collapsed(!is_collapsed);
  }, [is_collapsed, set_collapsed]);

  const toggle_children = useCallback((item_id) => {
    if (!is_valid_id(item_id)) return;

    set_open_children_map((prev_state) => ({
      ...prev_state,
      [item_id]: !prev_state[item_id],
    }));
  }, []);

  const is_children_open = useCallback(
    (item_id) => {
      if (!is_valid_id(item_id)) return false;

      if (Object.prototype.hasOwnProperty.call(open_children_map, item_id)) {
        return open_children_map[item_id];
      }

      return item_id === active_item_id;
    },
    [active_item_id, open_children_map],
  );

  const open_item_children = useCallback((item_id) => {
    if (!is_valid_id(item_id)) return;

    set_open_children_map((prev_state) => ({
      ...prev_state,
      [item_id]: true,
    }));
  }, []);

  const handle_item_click = useCallback(
    (item) => {
      const item_id = item?.id ?? null;

      set_active_item_id(item_id);
      set_active_child_id(null);
      open_item_children(item_id);

      on_item_click?.(item_id);
    },
    [on_item_click, open_item_children],
  );

  const handle_child_click = useCallback(
    (item, child) => {
      const item_id = item?.id ?? null;
      const child_id = child?.id ?? null;

      set_active_item_id(item_id);
      set_active_child_id(child_id);
      open_item_children(item_id);

      console.log("extra sidebar, child click, item_id:" , item_id, " child: "  , child);

      on_child_click?.(item_id, child_id);
    },
    [on_child_click, open_item_children],
  );

  const sidebar_items = useMemo(() => {
    return normalized_items.map((item, item_index) => {
      const item_children = normalize_array(item?.children);
      const item_badges_values = normalize_array(item?.badges_values);

      return {
        key: build_item_key(item, item_index),
        item,
        item_index,
        item_id: item?.id ?? null,
        item_children,
        item_badges_values,
        has_children: item_children.length > 0,
      };
    });
  }, [normalized_items]);

  return (
    <aside
      className={`${styles.extra_sidebar_root} ${
        is_collapsed ? styles.collapsed : styles.opened
      }`}
    >
      <div className={styles.extra_sidebar_top_row}>
        {
          loading && <span className="spinner" style={{ marginRight: 8 }} />
        }
        <span className={styles.extra_sidebar_title}>{title || "Navigation"}</span>
        <button
          type="button"
          className={styles.collapse_btn}
          onClick={handle_collapse_click}
          aria-label={is_collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {is_collapsed ? "»" : "«"}
        </button>
      </div>

      <div className={styles.items_root}>
        {sidebar_items.map(
          ({ key, item, item_index, item_id, item_children, item_badges_values, has_children }) => {
            const opened = has_children && is_children_open(item_id);
            const item_active = item_id === active_item_id;
            const item_label = item?.label || "-";

            return (
              <div className={styles.item_group} key={key}>
                <div
                  className={`${styles.item_row} ${item_active ? styles.item_active : ""}`}
                  onClick={() => handle_item_click(item)}
                  title={is_collapsed ? item_label : undefined}
                >
                  <span className={styles.item_collapsed_number}>{item_index + 1}</span>

                  <div className={styles.item_main_text}>
                    <span className={styles.item_label}>{item_label}</span>
                    {item?.is_loading && <span className="spinner" />}
                    <span className={styles.item_extra}>{item?.extralabel || ""}</span>

                    {item_badges_values.length > 0 && (
                      <div className={styles.badges_row}>
                        {item_badges_values.map((badge_value, badge_index) => (
                          <span
                            key={`${build_item_key(item, 0)}-${String(badge_value)}-${badge_index}`}
                            className={styles.badge_item}
                          >
                            {badge_value}
                          </span>
                        ))}
                      </div>
                    )}

                    <span className={styles.child_subtitle}>{item?.subtitle || ""}</span>
                  </div>

                  {has_children && (
                    <button
                      type="button"
                      className={styles.children_toggle_btn}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggle_children(item_id);
                      }}
                      aria-label={opened ? "Hide children" : "Show children"}
                    >
                      {opened ? "−" : "+"}
                    </button>
                  )}
                </div>

                {has_children && opened && (
                  <div className={styles.children_root}>
                    {item_children.map((child, child_index) => {
                      const child_active = child?.id === active_child_id || child?.active;
                      const child_badges_values = normalize_array(child?.badges_values);

                      return (
                        <div
                          key={build_child_key(item, child, child_index)}
                          className={`${styles.child_row} ${
                            child_active ? styles.child_active : ""
                          }`}
                          onClick={() => handle_child_click(item, child)}
                        >
                          <div className={styles.child_texts}>
                            <span className={styles.child_title}>{child?.title || "-"}</span>

                            <div className={styles.badges_row}>
                              {child_badges_values.map((badge_value, badge_index) => (
                                <span
                                  key={`${build_child_key(item, child, 0)}-${String(badge_value)}-${badge_index}`}
                                  className={styles.badge_item}
                                >
                                  {badge_value}
                                </span>
                              ))}
                            </div>

                            <span className={styles.child_subtitle}>
                              {child?.subtitle || ""}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          },
        )}
      </div>
    </aside>
  );
}
