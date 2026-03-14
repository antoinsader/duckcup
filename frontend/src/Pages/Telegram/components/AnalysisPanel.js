import {
  ANALYSIS_TYPES_LIMIT,
  ANALYSIS_VALUES_LIMIT,
  build_analysis_chip_id,
  normalize_message_id,
} from "../entities_helpers";

import styles from "../Telegram.module.scss";

export default function AnalysisPanel({
  account_id,
  has_selected_senders,
  analysis_entities_map,
  entities_descriptions_map,
  analysis_loading,
  analysis_error,
  selected_analysis_chips_map,
  selected_analysis_chips_rows,
  expanded_analysis_types_by_account,
  on_toggle_analysis_chip,
  on_toggle_analysis_show_more,
  allowed_message_ids,
}) {




  




  const safe_analysis_entities_map =
    analysis_entities_map &&
    typeof analysis_entities_map === "object" &&
    !Array.isArray(analysis_entities_map)
      ? analysis_entities_map
      : {};
  const safe_entities_descriptions_map =
    entities_descriptions_map &&
    typeof entities_descriptions_map === "object" &&
    !Array.isArray(entities_descriptions_map)
      ? entities_descriptions_map
      : {};

  const analysis_type_labels = Object.keys(safe_analysis_entities_map).slice(
    0,
    ANALYSIS_TYPES_LIMIT,
  );
 

  const analysis_groups_data = analysis_type_labels
    .map((entity_label) => {
      const raw_values_map =
        safe_analysis_entities_map[entity_label] &&
        typeof safe_analysis_entities_map[entity_label] === "object" &&
        !Array.isArray(safe_analysis_entities_map[entity_label])
          ? safe_analysis_entities_map[entity_label]
          : {};

      const all_chip_rows = Object.entries(raw_values_map)
        .map(([entity_text, message_ids]) => {
          const normalized_ids = Array.isArray(message_ids)
            ? message_ids
                .map((message_id) => normalize_message_id(message_id))
                .filter((message_id) => Boolean(message_id))
            : [];

          const visible_message_ids = allowed_message_ids
            ? normalized_ids.filter((message_id) =>
                allowed_message_ids.has(message_id),
              )
            : normalized_ids;

          return {
            entity_label,
            entity_text,
            message_ids: visible_message_ids,
          };
        })
        .filter((chip_row) => chip_row.message_ids.length > 0);

      const has_active_chip = all_chip_rows.some((chip_row) => {
        const chip_id = build_analysis_chip_id(
          chip_row.entity_label,
          chip_row.entity_text,
        );
        return Boolean(selected_analysis_chips_map[chip_id]);
      });

      const total_messages_count = all_chip_rows.reduce(
        (acc_value, chip_row) => {
          const message_count = Array.isArray(chip_row?.message_ids)
            ? chip_row.message_ids.length
            : 0;
          return acc_value + message_count;
        },
        0,
      );

      return {
        entity_label,
        entity_description:
          safe_entities_descriptions_map[entity_label] || "Entity category",
        all_chip_rows,
        has_active_chip,
        total_messages_count,
      };
    })
    .filter((group_row) => group_row.all_chip_rows.length > 0)
    .sort((left_group, right_group) => {
      if (left_group.has_active_chip !== right_group.has_active_chip) {
        return left_group.has_active_chip ? -1 : 1;
      }

      if (
        left_group.total_messages_count !== right_group.total_messages_count
      ) {
        return (
          right_group.total_messages_count - left_group.total_messages_count
        );
      }

      return String(left_group.entity_description || "").localeCompare(
        String(right_group.entity_description || ""),
      );
    });

  const expanded_analysis_types = account_id
    ? expanded_analysis_types_by_account[account_id] || {}
    : {};
  const analysis_error_value = analysis_error || "";

  return (
    <>
      <div className={styles.analysis_panel_root}>
        <div className={styles.card_header}>
          <div className={styles.card_header_row}>
            <h2 className={styles.card_header_title}>Entity types</h2>
          </div>
          <span className={styles.card_header_badge}>
            {selected_analysis_chips_rows.length > 0
              ? `${selected_analysis_chips_rows.length} signals active`
              : "No signals selected"}
          </span>
        </div>

        {!has_selected_senders && (
          <div className={styles.analysis_empty_state}>
            Choose an entity to see the analysis chips.
          </div>
        )}

        {has_selected_senders && analysis_loading && (
          <div className={styles.analysis_empty_state}>
            Analyzing messages...
          </div>
        )}

        {has_selected_senders && !analysis_loading && analysis_error_value && (
          <div className={styles.analysis_error_state}>
            Analysis unavailable: {analysis_error_value}
          </div>
        )}

        {has_selected_senders &&
          !analysis_loading &&
          !analysis_error_value &&
          analysis_type_labels.length === 0 && (
            <div className={styles.analysis_empty_state}>
              No analysis entities found for this chat.
            </div>
          )}

        {has_selected_senders &&
          !analysis_loading &&
          !analysis_error_value &&
          analysis_type_labels.length > 0 &&
          analysis_groups_data.length === 0 && (
            <div className={styles.analysis_empty_state}>
              No entity signals found for the selected date filter.
            </div>
          )}

        {has_selected_senders &&
          !analysis_loading &&
          !analysis_error_value &&
          analysis_groups_data.length > 0 && (
            <div className={styles.analysis_groups_root}>
              {analysis_groups_data.map((group_row) => {
                const { entity_label, entity_description, all_chip_rows } =
                  group_row;

                const sorted_chip_rows = [...all_chip_rows].sort(
                  (left_chip, right_chip) => {
                    const left_chip_id = build_analysis_chip_id(
                      left_chip.entity_label,
                      left_chip.entity_text,
                    );
                    const right_chip_id = build_analysis_chip_id(
                      right_chip.entity_label,
                      right_chip.entity_text,
                    );

                    const left_is_active = Boolean(
                      selected_analysis_chips_map[left_chip_id],
                    );
                    const right_is_active = Boolean(
                      selected_analysis_chips_map[right_chip_id],
                    );

                    if (left_is_active !== right_is_active) {
                      return left_is_active ? -1 : 1;
                    }

                    const left_message_count = Array.isArray(
                      left_chip?.message_ids,
                    )
                      ? left_chip.message_ids.length
                      : 0;
                    const right_message_count = Array.isArray(
                      right_chip?.message_ids,
                    )
                      ? right_chip.message_ids.length
                      : 0;

                    if (left_message_count !== right_message_count) {
                      return right_message_count - left_message_count;
                    }

                    return String(left_chip.entity_text || "").localeCompare(
                      String(right_chip.entity_text || ""),
                    );
                  },
                );

                const baseline_chip_rows = sorted_chip_rows.filter(
                  (chip_row, chip_index) => {
                    if (chip_index === 0) return true;
                    const message_count = Array.isArray(chip_row?.message_ids)
                      ? chip_row.message_ids.length
                      : 0;
                    return message_count > ANALYSIS_VALUES_LIMIT;
                  },
                );

                const baseline_chip_ids = new Set(
                  baseline_chip_rows.map((chip_row) =>
                    build_analysis_chip_id(
                      chip_row.entity_label,
                      chip_row.entity_text,
                    ),
                  ),
                );

                const remaining_chip_rows = sorted_chip_rows.filter(
                  (chip_row) => {
                    const chip_id = build_analysis_chip_id(
                      chip_row.entity_label,
                      chip_row.entity_text,
                    );
                    return !baseline_chip_ids.has(chip_id);
                  },
                );

                const extra_visible_raw = Number(
                  expanded_analysis_types[entity_label],
                );
                const extra_visible_count =
                  Number.isFinite(extra_visible_raw) && extra_visible_raw > 0
                    ? extra_visible_raw
                    : 0;

                const visible_chip_rows = [
                  ...baseline_chip_rows,
                  ...remaining_chip_rows.slice(0, extra_visible_count),
                ];
                const remaining_count = Math.max(
                  remaining_chip_rows.length - extra_visible_count,
                  0,
                );
                const has_more = remaining_count > 0;
                const can_show_less = extra_visible_count > 0;
                const show_more_count =
                  extra_visible_count === 0 &&
                  baseline_chip_rows.length === 1 &&
                  sorted_chip_rows.length > 5
                    ? Math.min(4, remaining_count)
                    : Math.min(ANALYSIS_VALUES_LIMIT, remaining_count);

                return (
                  <div
                    key={entity_label}
                    className={styles.analysis_group_item}
                  >
                    <div className={styles.analysis_group_header}>
                      <span className={styles.analysis_group_title}>
                        {entity_description}
                      </span>
                      <span className={styles.analysis_group_subtitle}>
                        {entity_label}
                      </span>
                    </div>

                    <div className={styles.analysis_chips_row}>
                      {visible_chip_rows.map((chip_row) => {
                        const chip_id = build_analysis_chip_id(
                          chip_row.entity_label,
                          chip_row.entity_text,
                        );
                        const is_active = Boolean(
                          selected_analysis_chips_map[chip_id],
                        );

                        return (
                          <button
                            type="button"
                            key={chip_id}
                            className={`${styles.analysis_chip_item} ${
                              is_active ? styles.active : ""
                            }`}
                            onClick={() =>
                              on_toggle_analysis_chip(account_id, chip_id)
                            }
                          >
                            <span className={styles.analysis_chip_name}>
                              {chip_row.entity_text}
                            </span>
                            <span className={styles.analysis_chip_count}>
                              {Array.isArray(chip_row.message_ids)
                                ? chip_row.message_ids.length
                                : 0}
                            </span>
                          </button>
                        );
                      })}

                      {(has_more || can_show_less) && (
                        <button
                          type="button"
                          className={styles.analysis_show_more_chip}
                          onClick={() =>
                            on_toggle_analysis_show_more(
                              account_id,
                              entity_label,
                              remaining_chip_rows.length,
                              show_more_count,
                            )
                          }
                        >
                          {has_more
                            ? `Show ${show_more_count} more`
                            : "Show less"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </>
  );
}
