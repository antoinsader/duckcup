import { useEffect, useMemo, useState } from "react";
import styles from "../Telegram.module.scss";
import { FaChevronCircleDown, FaChevronCircleUp } from "react-icons/fa";

export default function Senders({
  account_id,
  senders_loading,
  account_senders,

  selected_senders_map,
  selected_sender_limits_map,

  filtered_messages,

  on_sender_chip_click,
  on_sender_limit_change,
  on_sender_details_click,

}) {

  const SENDERS_PAGE_SIZE = 4;
  const MESSAGE_LIMIT_OPTIONS = [50, 100, 200, 500, 1000];


  const [card_content_open, set_card_content_open] = useState(true);
  const [sender_search_value, set_sender_search_value] = useState("");
  const [visible_senders_count, set_visible_senders_count] =
    useState(SENDERS_PAGE_SIZE);

  useEffect(() => {
    set_visible_senders_count(SENDERS_PAGE_SIZE);
  }, [sender_search_value]);

  const filtered_messages_count_by_sender = useMemo(() => {
    if (!filtered_messages) return {};

    return filtered_messages.reduce((acc_value, message_row) => {
      const sender_chat_id = String(message_row?.chat_id || "");
      if (!sender_chat_id) return acc_value;

      acc_value[sender_chat_id] = (acc_value[sender_chat_id] || 0) + 1;
      return acc_value;
    }, {});
  }, [filtered_messages]);
  const filtered_sender_rows = useMemo(() => {
    const search_value = String(sender_search_value || "")
      .trim()
      .toLowerCase();

    if (!search_value) return account_senders;

    return account_senders.filter((entity_row) => {
      const chat_name = String(entity_row?.chat_name || "").toLowerCase();
      const chat_id = String(entity_row?.chat_id || "").toLowerCase();
      const chat_type = String(entity_row?.chat_type || "").toLowerCase();

      return (
        chat_name.includes(search_value) ||
        chat_id.includes(search_value) ||
        chat_type.includes(search_value)
      );
    });
  }, [account_senders, sender_search_value]);

  const ordered_sender_rows = useMemo(() => {
    return filtered_sender_rows
      .map((entity_row, row_index) => {


        const chat_id = entity_row?.chat_id;

        return {
          entity_row,
          row_index,
          is_selected: Boolean(selected_senders_map?.[chat_id]),
        };
      })
      .sort((left_row, right_row) => {
        if (left_row.is_selected === right_row.is_selected) {
          return left_row.row_index - right_row.row_index;
        }

        return left_row.is_selected ? -1 : 1;
      })
      .map((row_item) => row_item.entity_row);
  }, [
    account_id,
    filtered_sender_rows,
    selected_senders_map,
  ]);

  const visible_sender_rows = useMemo(() => {
    return ordered_sender_rows.slice(0, visible_senders_count);
  }, [ordered_sender_rows, visible_senders_count]);

  const handle_sender_chip_select = (entity_row) => {
    set_sender_search_value("");
    on_sender_chip_click(entity_row);
  };

  const remaining_sender_count = Math.max(
    ordered_sender_rows.length - visible_sender_rows.length,
    0,
  );
  const has_more_senders = remaining_sender_count > 0;

  const can_show_less_senders =
    !has_more_senders && ordered_sender_rows.length > SENDERS_PAGE_SIZE;

  const handle_sender_show_more = () => {
    if (has_more_senders) {
      set_visible_senders_count((prev_count) => {
        return Math.min(
          prev_count + SENDERS_PAGE_SIZE,
          ordered_sender_rows.length,
        );
      });
      return;
    }

    set_visible_senders_count(SENDERS_PAGE_SIZE);
  };

  return (
    <div className={styles.sender_filter_card}>
      <div className={styles.card_header}  onClick={(e) => {e.preventDefault(); set_card_content_open((prev_value) => !prev_value)}}>
        <div className={styles.card_header_row}>
          <h2 className={styles.card_header_title}>Senders</h2>
          <p className={styles.card_header_badge}>
            {Object.values(selected_senders_map).filter((is_selected) => is_selected).length} active
          </p>
        </div>

        <div className={styles.sender_filter_tools}>
          {
            card_content_open && (
<>

              <input
              type="text"
              value={sender_search_value}
            className={styles.sender_search_input}
            onChange={(event_value) =>
              set_sender_search_value(event_value.target.value)
            }
            placeholder="Search senders"
            />

          <span className={styles.sender_filter_meta}>
            {senders_loading
              ? "Loading senders..."
              : `${ordered_sender_rows.length} shown • ${account_senders.length} total`}
          </span>
</>
            )}

          {
            card_content_open ?
              <FaChevronCircleDown />
              :
              <FaChevronCircleUp />
          }

        </div>
      </div>

      <div className={`${styles.sender_chips_row} ${!card_content_open ? styles.hidden : ""}`}>

        {!senders_loading && account_senders.length === 0 && (
          <div className={styles.analysis_empty_state}>
            No senders found for this account.
          </div>
        )}


        {visible_sender_rows.map((entity_row) => {

          const chat_id = entity_row?.chat_id;
          const is_selected = Boolean(selected_senders_map[chat_id]);
          const selected_limit =
            Number(selected_sender_limits_map?.[chat_id]) || 100;


          const sender_filtered_messages_count =
            Number(
              filtered_messages_count_by_sender[
              String(entity_row?.chat_id || "")
              ],
            ) || 0;

          return (
            <div
              role="button"
              tabIndex={0}
              key={chat_id}
              className={`${styles.sender_chip_item} ${is_selected ? styles.active : ""}`}
              onClick={() => handle_sender_chip_select(entity_row)}
              onKeyDown={(event_value) => {
                if (event_value.key === "Enter" || event_value.key === " ") {
                  event_value.preventDefault();
                  handle_sender_chip_select(entity_row);
                }
              }}
            >
              <div className={styles.sender_chip_texts}>
                <span className={styles.sender_chip_name}>
                  {entity_row?.chat_name || entity_row?.chat_id || "Unknown"}
                </span>
                <span className={styles.sender_chip_type}>
                  {entity_row?.chat_type || "unknown"}
                </span>
                {is_selected && (
                  <span className={styles.sender_chip_filtered_count}>
                    {sender_filtered_messages_count} filtered message
                    {sender_filtered_messages_count === 1 ? "" : "s"}
                  </span>
                )}
              </div>

              <div
                className={styles.sender_chip_actions_column}
                onClick={(event_value) => event_value.stopPropagation()}
              >
                {is_selected && (
                  <div className={styles.sender_limit_select_root}>
                    <select
                      value={String(selected_limit)}
                      className={styles.sender_limit_select}
                      onChange={(event_value) => {
                        on_sender_limit_change(
                          entity_row,
                          event_value.target.value,
                        );
                      }}
                    >
                      {MESSAGE_LIMIT_OPTIONS.map((limit_value) => (
                        <option key={limit_value} value={limit_value}>
                          {limit_value}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="button"
                  className={styles.sender_chip_details_button}
                  onClick={(event_value) => {
                    event_value.stopPropagation();
                    on_sender_details_click(entity_row);
                  }}
                >
                  Details
                </button>
              </div>
            </div>
          );
        })}

        {(has_more_senders || can_show_less_senders) && (
          <button
            type="button"
            className={styles.sender_show_more_chip}
            onClick={handle_sender_show_more}
          >
            {has_more_senders
              ? `Show ${Math.min(SENDERS_PAGE_SIZE, remaining_sender_count)} more`
              : "Show less"}
          </button>
        )}
      </div>
    </div>
  );
}
