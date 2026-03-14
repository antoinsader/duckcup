import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  analyze_messages, 
  get_telegram_chats,
  get_telegram_entities,
  get_telegram_message_media,
} from "../../lib/backend/telegram";
import { useUserContext } from "../../lib/contexts/UserContext";

import ExtraSideBar from "../../components/layout_shell/ExtraSideBar";
import RowDetailsPopup from "../../components/page_components/RowDetailsPopup";

import AccountEntitySection from "./components/AccountEntitySection";
import MessageMediaPreview from "./components/MessageMediaPreview";
import {
  ANALYSIS_VALUES_LIMIT,
  DATE_FILTER_PRESETS,
  build_scoped_message_id,
  build_sidebar_entity_id,
  get_account_default_open_item_ids,
  get_messages_columns,
  normalize_message_id,
} from "./entities_helpers";

import styles from "./Telegram.module.scss";

const MESSAGE_LIMIT_DEFAULT = 100;

export default function TelegramPage() {
  const { accounts_data, accounts_loading, accounts_error } = useUserContext();
  // STATES:
  // STATES: ENTITIES DATA
  const [entities_by_account, set_entities_by_account] = useState({});
  const [entities_loading_by_account, set_entities_loading_by_account] =
    useState({});

  // STATES: MESSAGES DATA
  const [messages_by_entity, set_messages_by_entity] = useState({});
  const [messages_loading_by_entity, set_messages_loading_by_entity] = useState(
    {},
  );

  // STATES: ANALYSIS DATA
  const [analysis_by_account, set_analysis_by_account] = useState({});
  const [analysis_loading_by_account, set_analysis_loading_by_account] = useState(
    {},
  );
  const [analysis_error_by_account, set_analysis_error_by_account] = useState({});
  const [
    selected_analysis_chips_by_account,
    set_selected_analysis_chips_by_account,
  ] = useState({});
  const [
    expanded_analysis_types_by_account,
    set_expanded_analysis_types_by_account,
  ] = useState({});

  //STATES: DATE DATA
  const [selected_date_filter_by_account, set_selected_date_filter_by_account] =
    useState({});

  //STATES: SENDERS DATA
  const [selected_senders_by_account, set_selected_senders_by_account] =
    useState({});
  const [
    selected_sender_limits_by_account,
    set_selected_sender_limits_by_account,
  ] = useState({});

  // STATES: SIDEBAR DATA
  const [active_sidebar_item_id, set_active_sidebar_item_id] = useState(null);
  const [active_sidebar_child_id, set_active_sidebar_child_id] = useState(null);
  const [sidebar_loading, set_sidebar_loading] = useState(false);

  // STATES: POPUP DATA
  const [selected_entity_popup_data, set_selected_entity_popup_data] =
    useState(null);
  const [selected_message_popup_data, set_selected_message_popup_data] =
    useState(null);
  const [selected_entity_popup_title, set_selected_entity_popup_title] =
    useState("Entity Details");
  const [selected_message_popup_title, set_selected_message_popup_title] =
    useState("Message Details");

  // STATES: POPUP MEDIA DATA
  const [message_media_url, set_message_media_url] = useState("");
  const [message_media_mime_type, set_message_media_mime_type] = useState("");
  const [message_media_file_name, set_message_media_file_name] = useState("");
  const [message_media_loading, set_message_media_loading] = useState(false);
  const [message_media_error, set_message_media_error] = useState("");
  const [message_media_has_attempted, set_message_media_has_attempted] =
    useState(false);

  // REFS
  const account_row_refs = useRef({});
  const entity_row_refs = useRef({});
  const message_media_url_ref = useRef("");
  const message_media_request_id_ref = useRef(0);



  // MEMOS  
  const messaging_accounts_data = useMemo(() => {
    return (accounts_data || []).filter((account_data) => {
      return String(account_data?.provider_type || "").trim().toUpperCase() === "MESSAGING";
    });
  }, [accounts_data]);
  const messaging_accounts_by_id = useMemo(() => {
    return (messaging_accounts_data || []).reduce((acc_value, account_data) => {
      const account_id = String(account_data?.account_id || "");
      if (!account_id) return acc_value;
      acc_value[account_id] = account_data;
      return acc_value;
    }, {});
  }, [messaging_accounts_data]);

  const messages_columns = useMemo(() => {
    return get_messages_columns();
  }, []);


  // CALLBACKS
  const cleanup_message_media_url = useCallback(() => {
    if (!message_media_url_ref.current) return;
    URL.revokeObjectURL(message_media_url_ref.current);
    message_media_url_ref.current = "";
  }, []);

  const sort_messages_by_date_desc = useCallback((message_rows = []) => {
    return [...message_rows].sort((left_row, right_row) => {
      const left_time = new Date(left_row?.date).getTime();
      const right_time = new Date(right_row?.date).getTime();

      const safe_left_time = Number.isNaN(left_time) ? -Infinity : left_time;
      const safe_right_time = Number.isNaN(right_time) ? -Infinity : right_time;

      if (safe_left_time === safe_right_time) {
        const left_message_id = String(left_row?.message_id || "");
        const right_message_id = String(right_row?.message_id || "");
        return right_message_id.localeCompare(left_message_id);
      }

      return safe_right_time - safe_left_time;
    });
  }, []);

  const handle_entity_action_popup_open = useCallback(
    (entity_row) => {
      if (!entity_row) return;



      set_selected_entity_popup_data(entity_row);
      set_selected_entity_popup_title(
        `Entity Details - ${entity_row?.chat_name || entity_row?.chat_id || "Unknown"}`,
      );
    },
    [messaging_accounts_by_id],
  );

  const fetch_account_entities = useCallback(async (account_id) => {
    if (!account_id) return [];

    set_entities_loading_by_account((prev_state) => ({
      ...prev_state,
      [account_id]: true,
    }));


    try {
      const response = await get_telegram_entities(account_id);
      const raw_entities_rows = Array.isArray(response) ? response : [];
      const entities_rows = raw_entities_rows
        .filter((entity_row) => {
          return (
            entity_row &&
            entity_row.chat_id
          );
        })


      set_entities_by_account((prev_state) => ({
        ...prev_state,
        [account_id]: entities_rows,
      }));

      return entities_rows;
    } catch (ex) {
      console.error("[Entities] failed loading entities", {
        account_id,
        error: ex,
      });

      set_entities_by_account((prev_state) => ({
        ...prev_state,
        [account_id]: [],
      }));
      return [];
    } finally {
      set_entities_loading_by_account((prev_state) => ({
        ...prev_state,
        [account_id]: false,
      }));
    }
  }, []);

  const fetch_entity_messages = useCallback(
    async (account_id, entity_row, requested_limit = MESSAGE_LIMIT_DEFAULT) => {
      const entity_id = entity_row?.chat_id;
      if (!account_id || !entity_id) return [];
      const message_limit = Math.max(
        Number(requested_limit) || MESSAGE_LIMIT_DEFAULT,
        1,
      );

      const sidebar_entity_id = build_sidebar_entity_id(account_id, entity_id);

      set_messages_by_entity((prev_state) => ({
        ...prev_state,
        [sidebar_entity_id]: [],
      }));

      set_messages_loading_by_entity((prev_state) => ({
        ...prev_state,
        [sidebar_entity_id]: true,
      }));


      try {
        const response = await get_telegram_chats(
          account_id,
          entity_id,
          message_limit,
        );
        const raw_message_rows = Array.isArray(response) ? response : [];
        const message_rows = raw_message_rows.map((message_row, row_index) => {
          const normalized_message_id =
            normalize_message_id(message_row?.message_id) || `row_${row_index}`;

          return {
            ...message_row,
            __account_id: account_id,
            __sidebar_entity_id: sidebar_entity_id,
            __entity_chat_id: entity_id,
            __entity_chat_name: entity_row?.chat_name || String(entity_id),
            __scoped_message_id: build_scoped_message_id(
              sidebar_entity_id,
              normalized_message_id,
            ),
          };
        });
        const unique_messages_map = message_rows.reduce(
          (acc_value, message_row) => {
            const scoped_message_id = String(
              message_row?.__scoped_message_id || "",
            );
            if (!scoped_message_id || acc_value.has(scoped_message_id))
              return acc_value;
            acc_value.set(scoped_message_id, message_row);
            return acc_value;
          },
          new Map(),
        );
        const unique_message_rows = Array.from(unique_messages_map.values());
        const sorted_message_rows =
          sort_messages_by_date_desc(unique_message_rows);

        set_messages_by_entity((prev_state) => ({
          ...prev_state,
          [sidebar_entity_id]: sorted_message_rows,
        }));


        return sorted_message_rows;
      } catch (ex) {
        console.error("[Entities] failed loading messages", {
          account_id,
          entity_id,
          error: ex,
        });

        set_messages_by_entity((prev_state) => ({
          ...prev_state,
          [sidebar_entity_id]: [],
        }));
        return [];
      } finally {
        set_messages_loading_by_entity((prev_state) => ({
          ...prev_state,
          [sidebar_entity_id]: false,
        }));
      }
    },
    [sort_messages_by_date_desc],
  );

  const fetch_entity_analysis = useCallback(
    async (account_id, entities_with_limits) => {
      if (!account_id || !Array.isArray(entities_with_limits) || entities_with_limits.length === 0) return null;


      set_analysis_loading_by_account((prev_state) => ({
        ...prev_state,
        [account_id]: true,
      }));
      set_analysis_error_by_account((prev_state) => ({
        ...prev_state,
        [account_id]: "",
      }));



      try {
        // Call new API signature
        const response = await analyze_messages(account_id, entities_with_limits);
        // response: { analysis_entities, entities_descriptions }
        // We want to store analysis by sidebar_entity_id
        const analysis_entities = response?.analysis_entities || {};


        const account_entities = [];
        const entities_texts = Object.entries(analysis_entities).forEach(([entity_label, entity_values]) => {
          Object.entries(entity_values).forEach(([entity_text, message_ids]) => {
            account_entities.push({
              entity_text: entity_text,
              entity_ids: message_ids, 
            });
          });
        });

        set_analysis_by_account((prev_state) => ({
          ...prev_state,
          [account_id]: entities_texts,
        }));

        return true;
      } catch (ex) {
        console.error("[Entities] failed loading analysis", {
          account_id,
          entities_with_limits,
          error: ex,
        });
        set_analysis_error_by_account((prev_state) => ({
          ...prev_state,
          [account_id]: String(ex || "Analysis failed"),
        }));
        set_analysis_by_account((prev_state) =>({
          ...prev_state,
          [account_id]: [],
        }));
        return null;
      } finally {
      set_analysis_loading_by_account((prev_state) => ({
        ...prev_state,
        [account_id]: true,
      }));


      }
    },
    [],
  );

  const toggle_analysis_chip = useCallback((account_id, chip_id) => {
    if (!account_id || !chip_id) return;

    set_selected_analysis_chips_by_account((prev_state) => {
      const prev_selection = prev_state[account_id] || {};
      if (prev_selection[chip_id]) {
        const next_selection = { ...prev_selection };
        delete next_selection[chip_id];

        return {
          ...prev_state,
          [account_id]: next_selection,
        };
      }

      return {
        ...prev_state,
        [account_id]: {
          ...prev_selection,
          [chip_id]: true,
        },
      };
    });
  }, []);

  const toggle_analysis_show_more = useCallback(
    (account_id, entity_label, total_remaining_count, increment_by) => {
      if (!account_id || !entity_label) return;

      set_expanded_analysis_types_by_account((prev_state) => {
        const prev_entity_state = prev_state[account_id] || {};
        const total_count = Math.max(Number(total_remaining_count) || 0, 0);
        const increment_count = Math.max(
          Number(increment_by) || ANALYSIS_VALUES_LIMIT,
          1,
        );
        const current_visible_raw = Number(prev_entity_state[entity_label]);
        const current_visible_count =
          Number.isFinite(current_visible_raw) && current_visible_raw > 0
            ? current_visible_raw
            : 0;

        const next_visible_count =
          current_visible_count >= total_count
            ? 0
            : Math.min(current_visible_count + increment_count, total_count);

        return {
          ...prev_state,
          [account_id]: {
            ...prev_entity_state,
            [entity_label]: next_visible_count,
          },
        };
      });
    },
    [],
  );

  const select_date_filter = useCallback((account_id, date_filter_id) => {
    if (!account_id || !date_filter_id) return;

    set_selected_date_filter_by_account((prev_state) => {
      const current_filter_id = String(prev_state[account_id] || "");
      const next_filter_id =
        current_filter_id === date_filter_id ? "" : date_filter_id;

      return {
        ...prev_state,
        [account_id]: next_filter_id,
      };
    });
  }, []);

  const toggle_sender_selection = useCallback(
    async (account_id, entity_row) => {
      const entity_id = entity_row?.chat_id;
      if (!account_id || !entity_id) return;

      const sidebar_entity_id = build_sidebar_entity_id(account_id, entity_id);
      let should_fetch = false;
      let should_remove_limit = false;
      let resolved_message_limit = MESSAGE_LIMIT_DEFAULT;

      set_selected_senders_by_account((prev_state) => {
        const prev_account_selection = prev_state[account_id] || {};
        const is_selected = Boolean(prev_account_selection[sidebar_entity_id]);

        if (is_selected) {
          const next_account_selection = { ...prev_account_selection };
          delete next_account_selection[sidebar_entity_id];
          should_remove_limit = true;

          return {
            ...prev_state,
            [account_id]: next_account_selection,
          };
        }

        const account_limits_map =
          selected_sender_limits_by_account[account_id] || {};
        resolved_message_limit = Math.max(
          Number(account_limits_map[sidebar_entity_id]) ||
          MESSAGE_LIMIT_DEFAULT,
          1,
        );
        should_fetch = true;
        return {
          ...prev_state,
          [account_id]: {
            ...prev_account_selection,
            [sidebar_entity_id]: {...entity_row, limit: resolved_message_limit},
          },
        };
      });

      if (should_remove_limit) {
        set_selected_sender_limits_by_account((prev_state) => {
          const prev_account_limits = prev_state[account_id] || {};
          if (!prev_account_limits[sidebar_entity_id]) return prev_state;

          const next_account_limits = { ...prev_account_limits };
          delete next_account_limits[sidebar_entity_id];

          return {
            ...prev_state,
            [account_id]: next_account_limits,
          };
        });
      }

      set_active_sidebar_item_id(account_id);
      set_active_sidebar_child_id(sidebar_entity_id);

      if (should_fetch) {
        const entities_with_limits  = [];

        Object.values(selected_senders_by_account[account_id]).forEach((entity_info) => {
          entities_with_limits.push({
            chat_id: entity_info.chat_id,
            limit: entity_info.limit || MESSAGE_LIMIT_DEFAULT,
          })
        });
        entities_with_limits.push({
          chat_id: entity_row.chat_id,
          limit: resolved_message_limit,
        });
        console.log("entities_with_limits: " , entities_with_limits);

        await Promise.allSettled([
          fetch_entity_messages(account_id, entity_row, resolved_message_limit),
          // fetch_entities_analysis(account_id, [{ chat_id: entity_id }]),
        ]);
      }
    },
    [
      fetch_entity_messages,
      selected_sender_limits_by_account,
      selected_senders_by_account
    ],
  );

  const change_sender_message_limit = useCallback(
    async (account_id, entity_row, next_limit_value) => {
      const entity_id = entity_row?.chat_id;
      if (!account_id || !entity_id) return;

      const sidebar_entity_id = build_sidebar_entity_id(account_id, entity_id);
      const resolved_limit = Math.max(
        Number(next_limit_value) || MESSAGE_LIMIT_DEFAULT,
        1,
      );

      set_selected_sender_limits_by_account((prev_state) => {
        const prev_account_limits = prev_state[account_id] || {};
        return {
          ...prev_state,
          [account_id]: {
            ...prev_account_limits,
            [sidebar_entity_id]: resolved_limit,
          },
  
        };
      });

      console.log("[Entities] sender messages limit changed", {
        account_id,
        entity_id,
        limit: resolved_limit,
      });

      set_active_sidebar_item_id(account_id);
      set_active_sidebar_child_id(sidebar_entity_id);
      await fetch_entity_messages(account_id, entity_row, resolved_limit);
    },
    [fetch_entity_messages],
  );

  const is_message_in_date_filter = useCallback(
    (message_row, date_filter_id) => {
      if (!date_filter_id) return true;

      const message_date_raw = message_row?.date;
      const message_timestamp = new Date(message_date_raw).getTime();
      if (Number.isNaN(message_timestamp)) return false;

      const now_date = new Date();
      const now_timestamp = now_date.getTime();
      const start_today = new Date(
        now_date.getFullYear(),
        now_date.getMonth(),
        now_date.getDate(),
      );
      const start_yesterday = new Date(start_today);
      start_yesterday.setDate(start_today.getDate() - 1);
      const start_last_week = new Date(now_date);
      start_last_week.setDate(now_date.getDate() - 7);
      const start_last_3_weeks = new Date(now_date);
      start_last_3_weeks.setDate(now_date.getDate() - 21);
      const start_last_month = new Date(now_date);
      start_last_month.setMonth(now_date.getMonth() - 1);
      const start_last_6_months = new Date(now_date);
      start_last_6_months.setMonth(now_date.getMonth() - 6);
      const start_last_year = new Date(now_date);
      start_last_year.setFullYear(now_date.getFullYear() - 1);

      switch (date_filter_id) {
        case "last_hour":
          return message_timestamp >= now_timestamp - 60 * 60 * 1000;
        case "last_3_hours":
          return message_timestamp >= now_timestamp - 3 * 60 * 60 * 1000;
        case "last_12_hours":
          return message_timestamp >= now_timestamp - 12 * 60 * 60 * 1000;
        case "today":
          return message_timestamp >= start_today.getTime();
        case "yesterday":
          return (
            message_timestamp >= start_yesterday.getTime() &&
            message_timestamp < start_today.getTime()
          );
        case "last_week":
          return (
            message_timestamp >= start_last_week.getTime() &&
            message_timestamp <= now_timestamp
          );
        case "last_3_weeks":
          return (
            message_timestamp >= start_last_3_weeks.getTime() &&
            message_timestamp <= now_timestamp
          );
        case "last_month":
          return (
            message_timestamp >= start_last_month.getTime() &&
            message_timestamp <= now_timestamp
          );
        case "last_6_months":
          return (
            message_timestamp >= start_last_6_months.getTime() &&
            message_timestamp <= now_timestamp
          );
        case "last_year":
          return (
            message_timestamp >= start_last_year.getTime() &&
            message_timestamp <= now_timestamp
          );
        default:
          return true;
      }
    },
    [],
  );

  useEffect(() => {
    const load_entities_for_all_accounts = async () => {
      if (!messaging_accounts_data?.length) {
        set_entities_by_account({});
        set_entities_loading_by_account({});
        set_messages_by_entity({});
        set_messages_loading_by_entity({});
        set_analysis_by_account({});
        set_analysis_error_by_account({});
        set_analysis_loading_by_account({});
        set_selected_analysis_chips_by_account({});
        set_selected_date_filter_by_account({});
        set_expanded_analysis_types_by_account({});
        set_selected_senders_by_account({});
        set_selected_sender_limits_by_account({});
        set_active_sidebar_item_id(null);
        set_active_sidebar_child_id(null);
        set_sidebar_loading(false);
        return;
      }

      set_sidebar_loading(true);

      await Promise.allSettled(
        messaging_accounts_data.map(async (account_data) => {
          const account_id = account_data?.account_id;
          if (!account_id) return;
          await fetch_account_entities(account_id);
        }),
      );

      set_sidebar_loading(false);
    };

    load_entities_for_all_accounts();
  }, [fetch_account_entities, messaging_accounts_data]);

  const extra_sidebar_items = useMemo(() => {
    return messaging_accounts_data.map((account_data) => {
      const account_id = account_data?.account_id;

      return {
        id: account_id,
        label: account_data?.email || "Account",
        badges_values: [
          `${String(account_data?.provider_type || "") || "-"} - ${String(account_data?.email_provider_id || "") || "-"
          }`,
        ],
        is_loading: Boolean(entities_loading_by_account[account_id]),
        children: [],
      };
    });
  }, [messaging_accounts_data, entities_loading_by_account]);

  const default_open_item_ids = useMemo(() => {
    return get_account_default_open_item_ids(messaging_accounts_data);
  }, [messaging_accounts_data]);

  const handle_sidebar_item_click = useCallback(
    async (account_id) => {
      if (!account_id) return;

      const section_node = account_row_refs.current[account_id];
      if (section_node) {
        section_node.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      if (!Array.isArray(entities_by_account[account_id])) {
        await fetch_account_entities(account_id);
      }
    },
    [entities_by_account, fetch_account_entities],
  );



  const handle_message_row_popup_open = useCallback(
    (account_data, message_row) => {
      if (
        !message_row ||
        !account_data?.account_id ||
        !message_row?.__entity_chat_id
      )
        return;


      set_selected_message_popup_data(message_row);
      set_selected_message_popup_title(
        `Message Details - ${message_row?.__entity_chat_name || message_row?.__entity_chat_id || "Entity"}`,
      );

      cleanup_message_media_url();
      set_message_media_url("");
      set_message_media_mime_type("");
      set_message_media_file_name("");
      set_message_media_error("");
      set_message_media_loading(true);
      set_message_media_has_attempted(false);
      message_media_request_id_ref.current += 1;
      const active_request_id = message_media_request_id_ref.current;

      get_telegram_message_media(
        account_data?.account_id,
        message_row?.__entity_chat_id,
        message_row?.message_id,
      )
        .then((media_response) => {
          if (active_request_id !== message_media_request_id_ref.current)
            return;
          set_message_media_has_attempted(true);

          if (!media_response?.blob) {
            console.log("[Entities] no media returned", {
              account_id: account_data?.account_id,
              entity_id: message_row?.__entity_chat_id,
              message_id: message_row?.message_id,
            });
            return;
          }

          const media_url = URL.createObjectURL(media_response.blob);
          message_media_url_ref.current = media_url;
          set_message_media_url(media_url);
          set_message_media_mime_type(media_response?.mime_type || "");
          set_message_media_file_name(
            media_response?.file_name || "telegram_media",
          );

          console.log("[Entities] media loaded", {
            account_id: account_data?.account_id,
            entity_id: message_row?.__entity_chat_id,
            message_id: message_row?.message_id,
            mime_type: media_response?.mime_type,
          });
        })
        .catch((ex) => {
          if (active_request_id !== message_media_request_id_ref.current)
            return;
          console.error("[Entities] failed loading message media", {
            account_id: account_data?.account_id,
            entity_id: message_row?.__entity_chat_id,
            message_id: message_row?.message_id,
            error: ex,
          });
          set_message_media_has_attempted(true);
          set_message_media_error(String(ex || "Unable to load media"));
        })
        .finally(() => {
          if (active_request_id !== message_media_request_id_ref.current)
            return;
          set_message_media_loading(false);
        });
    },
    [cleanup_message_media_url],
  );

  useEffect(() => {
    return () => {
      cleanup_message_media_url();
    };
  }, [cleanup_message_media_url]);

  const register_account_ref = useCallback((account_id, node) => {
    account_row_refs.current[account_id] = node;
  }, []);

  const register_entity_ref = useCallback((sidebar_entity_id, node) => {
    entity_row_refs.current[sidebar_entity_id] = node;
  }, []);

  if (accounts_loading) {
    return (
      <div className={styles.page_state}>
        <div className="spinner"></div>
        <span>Loading accounts...</span>
      </div>
    );
  }

  if (accounts_error) {
    return <div className={styles.page_error}>{accounts_error}</div>;
  }

  if (!messaging_accounts_data?.length) {
    return (
      <div className={styles.page_state}>No messaging accounts found.</div>
    );
  }

  return (
    <>
      <div className={styles.telegram_page_root}>
        <ExtraSideBar
          title={
            sidebar_loading
              ? "Entities Explorer (loading...)"
              : "Entities Explorer"
          }
          items={extra_sidebar_items}
          on_item_click={handle_sidebar_item_click}
          active_item_id_external={active_sidebar_item_id}
          active_child_id_external={active_sidebar_child_id}
          default_open_item_ids={default_open_item_ids}
        />

        <div className={styles.accounts_cards_root}>
          {messaging_accounts_data.map((account_data) => {
            const account_id = account_data?.account_id;

            const account_entities = Array.isArray(
              entities_by_account[account_id],
            )
              ? entities_by_account[account_id]
              : [];
            const selected_senders_map =
              selected_senders_by_account[account_id] || {};
            const selected_sender_limits_map =
              selected_sender_limits_by_account[account_id] || {};
            const selected_sender_rows = Object.values(selected_senders_map);
            const selected_sidebar_entity_ids =
              Object.keys(selected_senders_map);

            const account_messages = sort_messages_by_date_desc(
              selected_sidebar_entity_ids.flatMap((sidebar_entity_id) => {
                const message_rows = Array.isArray(
                  messages_by_entity[sidebar_entity_id],
                )
                  ? messages_by_entity[sidebar_entity_id]
                  : [];
                return message_rows;
              }),
            );

            const selected_analysis_chips_map =
              selected_analysis_chips_by_account[account_id] || {};
            const selected_date_filter =
              selected_date_filter_by_account[account_id] || "";
            const has_selected_date_filter = DATE_FILTER_PRESETS.some(
              (filter_row) => filter_row.id === selected_date_filter,
            );

            const date_filtered_messages = has_selected_date_filter
              ? account_messages.filter((message_row) => {
                return is_message_in_date_filter(
                  message_row,
                  selected_date_filter,
                );
              })
              : account_messages;

            const date_filtered_message_ids = date_filtered_messages.reduce(
              (acc_value, message_row) => {
                const scoped_message_id = String(
                  message_row?.__scoped_message_id || "",
                );
                if (scoped_message_id) acc_value.add(scoped_message_id);
                return acc_value;
              },
              new Set(),
            );

            const merged_analysis_entities_map = {};
            const merged_entities_descriptions_map = {};
            const merged_analysis_chip_ids_map = {};

            // selected_sidebar_entity_ids.forEach((sidebar_entity_id) => {
  
        


              // Object.entries(analysis_entities_map).forEach(
                // ([entity_label, raw_values_map]) => {
                //   if (!merged_analysis_entities_map[entity_label]) {
                //     merged_analysis_entities_map[entity_label] = {};
                //   }

                  // const safe_values_map =
                  //   raw_values_map &&
                  //     typeof raw_values_map === "object" &&
                  //     !Array.isArray(raw_values_map)
                  //     ? raw_values_map
                  //     : {};

                  // Object.entries(safe_values_map).forEach(
                  //   ([entity_text, raw_message_ids]) => {
                  //     const scoped_message_ids = (
                  //       Array.isArray(raw_message_ids) ? raw_message_ids : []
                  //     )
                  //       .map((message_id) =>
                  //         build_scoped_message_id(
                  //           sidebar_entity_id,
                  //           message_id,
                  //         ),
                  //       )
                  //       .filter((scoped_id) =>
                  //         date_filtered_message_ids.has(scoped_id),
                  //       );

                  //     if (scoped_message_ids.length === 0) return;

                  //     const prev_ids =
                  //       merged_analysis_entities_map[entity_label][
                  //       entity_text
                  //       ] || [];
                  //     const next_ids_set = new Set([
                  //       ...prev_ids,
                  //       ...scoped_message_ids,
                  //     ]);
                  //     merged_analysis_entities_map[entity_label][entity_text] =
                  //       Array.from(next_ids_set);

                  //     const merged_chip_id = `${String(entity_label)}::${String(entity_text)}`;
                  //     merged_analysis_chip_ids_map[merged_chip_id] = {
                  //       entity_label,
                  //       entity_text,
                  //       message_ids:
                  //         merged_analysis_entities_map[entity_label][
                  //         entity_text
                  //         ],
                  //     };
                  //   },
                  // );
                // },
              // );
            // });
            const selected_analysis_chips_rows = [];
            // const selected_analysis_chips_rows = Object.keys(
            //   selected_analysis_chips_map,
            // )
            //   .map((chip_id) => merged_analysis_chip_ids_map[chip_id])
            //   .filter((chip_row) => Boolean(chip_row));

            // const selected_message_ids = selected_analysis_chips_rows.reduce(
            //   (acc_value, chip_row) => {
            //     const chip_message_ids = Array.isArray(chip_row?.message_ids)
            //       ? chip_row.message_ids
            //       : [];

            //     chip_message_ids.forEach((message_id) => {
            //       const normalized_message_id =
            //         normalize_message_id(message_id);
            //       if (normalized_message_id)
            //         acc_value.add(normalized_message_id);
            //     });

            //     return acc_value;
            //   },
            //   new Set(),
            // );

            const filtered_account_messages = sort_messages_by_date_desc(date_filtered_messages);
            // const filtered_account_messages =
            //   selected_message_ids.size === 0
            //     ? sort_messages_by_date_desc(date_filtered_messages)
            //     : date_filtered_messages.filter((message_row) => {
            //       return selected_message_ids.has(
            //         String(message_row?.__scoped_message_id || ""),
            //       );
            //     });

            const ordered_filtered_account_messages =
              sort_messages_by_date_desc(filtered_account_messages);

            const entities_loading = Boolean(
              entities_loading_by_account[account_id],
            );
            const messages_loading = selected_sidebar_entity_ids.some(
              (sidebar_entity_id) =>
                Boolean(messages_loading_by_entity[sidebar_entity_id]),
            );
            const analysis_loading =  analysis_loading_by_account[account_id];
            const analysis_error =  analysis_error_by_account[account_id];

            return (
              <AccountEntitySection
                key={account_id || account_data?.email}
                account_data={account_data}
                account_id={account_id}
                account_entities={account_entities}
                selected_senders_map={selected_senders_map}
                selected_sender_limits_map={selected_sender_limits_map}
                selected_sender_rows={selected_sender_rows}
                entities_loading={entities_loading}
                messages_loading={messages_loading}
                messages_columns={messages_columns}
                filtered_account_messages={ordered_filtered_account_messages}
                account_messages={account_messages}
                selected_analysis_chips_map={selected_analysis_chips_map}
                selected_analysis_chips_rows={selected_analysis_chips_rows}
                selected_date_filter={selected_date_filter}
                merged_analysis_entities_map={merged_analysis_entities_map}
                merged_entities_descriptions_map={
                  merged_entities_descriptions_map
                }
                analysis_loading={analysis_loading}
                analysis_error={analysis_error}
                expanded_analysis_types_by_account={
                  expanded_analysis_types_by_account
                }
                date_filtered_message_ids={date_filtered_message_ids}
                on_toggle_analysis_chip={toggle_analysis_chip}
                on_select_date_filter={select_date_filter}
                on_toggle_analysis_show_more={toggle_analysis_show_more}
                on_sender_chip_click={(entity_row) =>
                  toggle_sender_selection(account_id, entity_row)
                }
                on_sender_limit_change={(entity_row, next_limit_value) =>
                  change_sender_message_limit(
                    account_id,
                    entity_row,
                    next_limit_value,
                  )
                }
                on_sender_details_click={(entity_row) =>
                  handle_entity_action_popup_open({
                    ...entity_row,
                    __account_id: account_id,
                  })
                }
                on_message_row_click={(message_row) => {
                  handle_message_row_popup_open(account_data, message_row);
                }}
                on_register_account_ref={register_account_ref}
                on_register_entity_ref={register_entity_ref}
              />
            );
          })}
        </div>
      </div>

      <RowDetailsPopup
        is_visible={Boolean(selected_entity_popup_data)}
        close_popup={() => set_selected_entity_popup_data(null)}
        title={selected_entity_popup_title}
        row_data={selected_entity_popup_data}
      />

      <RowDetailsPopup
        is_visible={Boolean(selected_message_popup_data)}
        close_popup={() => {
          message_media_request_id_ref.current += 1;
          set_selected_message_popup_data(null);
          cleanup_message_media_url();
          set_message_media_url("");
          set_message_media_mime_type("");
          set_message_media_file_name("");
          set_message_media_loading(false);
          set_message_media_error("");
          set_message_media_has_attempted(false);
        }}
        title={selected_message_popup_title}
        row_data={selected_message_popup_data}
        extra_content={
          <MessageMediaPreview
            is_loading={message_media_loading}
            error_value={message_media_error}
            media_url={message_media_url}
            mime_type={message_media_mime_type}
            file_name={message_media_file_name}
            has_attempted={message_media_has_attempted}
          />
        }
      />
    </>
  );
}
