/* fdsaff
  ! To do:
    - when user choose a filter from the datatable filters then he chooses from the custom filters I have, the datatable filters are being removed
*/

import { useCallback, useMemo, useRef, useState } from "react";
import ExtraSideBar from "../../components/layout_shell/ExtraSideBar";

import styles from "../Telegram/Telegram.module.scss";
import { useUserContext } from "../../lib/contexts/UserContext";
import {
  analyze_messages,
  get_messages_multiple_chats,
  get_telegram_entities,
} from "../../lib/backend/telegram";
import {
  is_date_in_filter_preset,
  is_row_in_specific_date_range,
} from "../Telegram/entities_helpers";
import AccountSection from "../Telegram/components/AccountsSection";

const MESSAGE_LIMIT_DEFAULT = 100;

export default function TelegramPage() {
  const { accounts_data } = useUserContext();

  const [sidebar_loading, set_sidebar_loading] = useState(false);
  const [section_open_by_account, set_section_open_by_account] = useState({});

  // each account_id would have null or array of senders
  const [senders_by_account, set_senders_by_account] = useState({});
  const [senders_loading_by_account, set_senders_loading_by_account] = useState(
    {},
  );
  const [senders_error_by_account, set_senders_error_by_account] = useState({});

  // each account_id would have object containing chat_id and the value is the limit
  const [limits_by_account_sender, set_limits_by_account_sender] = useState({});

  // each account_id would have chat_id and the value is true if selected
  const [selected_senders_by_account, set_selected_senders_by_account] =
    useState({});
  // each account_id would have str of the date_filter_id
  const [selected_date_filter_by_account, set_selected_date_filter_by_account] =
    useState({});
  // each account_id would have array  of selected keyword filters
  const [
    selected_keyword_filters_by_account,
    set_selected_keyword_filters_by_account,
  ] = useState({});
  // each account_id would have a date value
  const [
    start_date_range_filter_by_account,
    set_start_date_range_filter_by_account,
  ] = useState({});
  const [
    end_date_range_filter_by_account,
    set_end_date_range_filter_by_account,
  ] = useState({});

  // each account_id would have null or array of keywords
  const [keywords_by_account, set_keywords_by_account] = useState({});
  // each account_id would have null or {keyword: [message_ids]} mapping
  const [
    account_keywords_mapping_messages,
    set_account_keywords_mapping_messages,
  ] = useState({});
  const [keywords_loading_by_account, set_keywords_loading_by_account] =
    useState({});
  const [keywords_error_by_account, set_keywords_error_by_account] = useState(
    {},
  );

  // each account_id would have null or array of messages
  const [db_messages_by_account, set_db_messages_by_account] = useState({});
  const [db_messages_loading_by_account, set_db_messages_loading_by_account] =
    useState({});
  const [db_messages_error_by_account, set_db_messages_error_by_account] =
    useState({});

  const telegram_accounts = useMemo(() => {
    return (accounts_data || []).filter((account_data) => {
      return (
        String(account_data?.provider_type || "")
          .trim()
          .toUpperCase() === "MESSAGING"
      );
    });
  }, [accounts_data]);

  const sidebar_items = useMemo(() => {
    return telegram_accounts.map((tg_account, idx) => {
      const account_id = tg_account?.account_id;

      const account_senders = senders_by_account[account_id] || [];
      const account_selected_senders =
        selected_senders_by_account[account_id] || {};

      const account_children = account_senders
        .filter((s) => account_selected_senders[s.chat_id] === true)
        .map((sender) => {
          const limit = limits_by_account_sender[account_id][sender.chat_id]
            ? `Limit: ${String(limits_by_account_sender[account_id][sender.chat_id])}`
            : null;

          const badges = [sender.chat_type, limit];
          return {
            id: sender.chat_id,
            title: sender.chat_name,
            badges_values: badges,
            is_selected: account_selected_senders[sender.chat_id] === true,
            active: account_selected_senders[sender.chat_id] === true,
          };
        })
        .sort((left_row, right_row) => {
          if (left_row.is_selected === right_row.is_selected) {
            return left_row.row_index - right_row.row_index;
          }

          return left_row.is_selected ? -1 : 1;
        });

      return {
        id: account_id,
        label: tg_account?.email || `Telegram account ${idx + 1}`,
        badges_values: [
          `${String(tg_account?.provider_type || "") || "-"} - ${String(tg_account?.email_provider_id || "") || "-"}`,
        ],
        is_loading: Boolean(senders_loading_by_account[account_id]),
        children: account_children,
      };
    });
  }, [
    telegram_accounts,
    senders_by_account,
    senders_loading_by_account,
    limits_by_account_sender,
    selected_senders_by_account,
  ]);

  // REFS
  const account_row_refs = useRef({});

  const fetch_account_senders = useCallback(async (account_id) => {
    if (!account_id) return null;

    set_sidebar_loading(true);
    set_senders_loading_by_account((prev) => ({
      ...prev,
      [account_id]: true,
    }));
    set_senders_error_by_account((prev) => ({
      ...prev,
      [account_id]: null,
    }));

    try {
      const response = await get_telegram_entities(account_id);
      const senders_raw = Array.isArray(response) ? response : [];

      const senders = senders_raw.filter((ele) => ele && ele.chat_id);

      set_senders_by_account((prev) => ({
        ...prev,
        [account_id]: senders,
      }));

      return senders;
    } catch (ex) {
      set_senders_error_by_account((prev) => ({
        ...prev,
        [account_id]: ex.toString() || "Error loading account senders",
      }));
    } finally {
      set_sidebar_loading(false);

      set_senders_loading_by_account((prev) => ({
        ...prev,
        [account_id]: false,
      }));
    }
  }, []);

  const fetch_account_messages = useCallback(
    async (
      account_id,
      updated_account_selected_senders = null,
      updated_account_limits = null,
    ) => {
      set_db_messages_loading_by_account((prev) => ({
        ...prev,
        [account_id]: true,
      }));
      set_db_messages_error_by_account((prev) => ({
        ...prev,
        [account_id]: null,
      }));

      set_keywords_loading_by_account((prev) => ({
        ...prev,
        [account_id]: true,
      }));

      set_keywords_error_by_account((prev) => ({
        ...prev,
        [account_id]: null,
      }));

      try {
        const selected_senders = updated_account_selected_senders
          ? updated_account_selected_senders
          : selected_senders_by_account[account_id] || {};
        const account_limits = updated_account_limits
          ? updated_account_limits
          : limits_by_account_sender[account_id] || {};

        const active_sender_chat_ids = Object.keys(selected_senders)
          .filter((chat_id) => selected_senders[chat_id] === true)
          .map((chat_id) => String(chat_id));

        const entities = active_sender_chat_ids.map((chat_id) => ({
          chat_id,
          limit: account_limits?.[chat_id] || MESSAGE_LIMIT_DEFAULT,
        }));

        const req_1 = get_messages_multiple_chats(account_id, entities);
        const req_2 = analyze_messages(account_id, entities);

        const [messages_response, analysis_response] = await Promise.all([
          req_1,
          req_2,
        ]);
        const messages = Array.isArray(messages_response)
          ? messages_response
          : [];
        const analysis_entities = analysis_response?.analysis_entities || {};

        const account_keywords = {};
        const keywords_set = new Set();
        Object.values(analysis_entities).forEach((entityGroup) => {
          Object.entries(entityGroup).forEach(([entityText, messages]) => {
            account_keywords[entityText] = messages;
            keywords_set.add(entityText);
          });
        });

        set_account_keywords_mapping_messages((prev) => {
          return {
            ...prev,
            [account_id]: account_keywords,
          };
        });

        set_db_messages_by_account((prev) => ({
          ...prev,
          [account_id]: messages,
        }));

        set_keywords_by_account((prev) => ({
          ...prev,
          [account_id]: [...keywords_set],
        }));
      } catch (ex) {
        set_db_messages_error_by_account((prev) => ({
          ...prev,
          [account_id]: ex.toString || "Error loading db messages",
        }));

        set_keywords_error_by_account((prev) => ({
          ...prev,
          [account_id]: ex.toString || "Error loading account keywords",
        }));
      } finally {
        set_keywords_loading_by_account((prev) => ({
          ...prev,
          [account_id]: false,
        }));

        set_db_messages_loading_by_account((prev) => ({
          ...prev,
          [account_id]: false,
        }));
      }
    },
    [selected_senders_by_account, limits_by_account_sender],
  );

  const handle_sidebar_account_click = useCallback(
    async (account_id) => {
      if (!account_id) return;

      set_section_open_by_account((prev) => ({
        ...prev,
        [account_id]: true,
      }));

      const section_node = account_row_refs?.current[account_id] || null;
      if (section_node) {
        section_node.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      if (!senders_by_account[account_id]) {
        await fetch_account_senders(account_id);
      }
    },
    [senders_by_account, fetch_account_senders],
  );

  const toggle_account_section_open = useCallback(
    async (account_id) => {
      if (!account_id) return;

      set_section_open_by_account((prev) => {
        const prev_section_open = prev[account_id] === true;
        const new_section_open = !prev_section_open;

        if (new_section_open && !senders_by_account[account_id]) {
          fetch_account_senders(account_id);
        }
        return {
          ...prev,
          [account_id]: new_section_open,
        };
      });
    },
    [senders_by_account, fetch_account_senders],
  );

  const sender_selected_function = useCallback(
    (sender_row, account_id) => {
      const chat_id = sender_row?.chat_id;
      if (!chat_id || !account_id) return;

      const is_sender_active_prev =
        selected_senders_by_account?.[account_id]?.[chat_id] === true;
      const new_sender_active = !is_sender_active_prev;

      set_selected_senders_by_account((prev) => {
        const account_selected_senders = prev[account_id] || {};
        const updated = {
          ...prev,
          [account_id]: {
            ...account_selected_senders,
            [chat_id]: new_sender_active,
          },
        };
        fetch_account_messages(account_id, updated[account_id]);

        return updated;
      });

      if (!new_sender_active) return;

      set_limits_by_account_sender((prev) => ({
        ...prev,
        [account_id]: {
          ...(prev[account_id] || {}),
          [chat_id]: prev?.[account_id]?.[chat_id] || MESSAGE_LIMIT_DEFAULT,
        },
      }));
    },
    [selected_senders_by_account, fetch_account_messages],
  );

  const keyword_filter_select_function = useCallback(
    (account_id, account_keyword) => {
      if (!account_id || !account_keyword) return;

      const is_keyword_active_prev =
        selected_keyword_filters_by_account?.[account_id]?.includes(
          account_keyword,
        ) === true;
      const new_keyword_active = !is_keyword_active_prev;

      set_selected_keyword_filters_by_account((prev) => {
        const account_prev_keywords = prev[account_id] || [];
        if (new_keyword_active) account_prev_keywords.push(account_keyword);
        else {
          const keyword_index = account_prev_keywords.findIndex(
            (keyword) => keyword === account_keyword,
          );
          if (keyword_index >= 0)
            account_prev_keywords.splice(keyword_index, 1);
        }
        return {
          ...prev,
          [account_id]: [...new Set(account_prev_keywords)],
        };
      });
    },
    [selected_keyword_filters_by_account],
  );

  const sender_limit_change_function = useCallback(
    (sender_row, new_limit, account_id) => {
      const chat_id = sender_row?.chat_id;
      if (!chat_id || !account_id) return;

      const resolved_limit = Math.max(
        Number(new_limit) || MESSAGE_LIMIT_DEFAULT,
        1,
      );

      set_limits_by_account_sender((prev) => {
        const prev_account_limits = prev[account_id] || {};

        const new_account_limits = {
          ...prev_account_limits,
          [chat_id]: resolved_limit,
        };

        fetch_account_messages(account_id, null, new_account_limits);

        const updated = {
          ...prev,
          [account_id]: new_account_limits,
        };

        return updated;
      });
    },
    [fetch_account_messages],
  );

  const date_filter_select_function = useCallback(
    (date_filter_id, account_id) => {
      if (!account_id) return;

      set_start_date_range_filter_by_account((prev) => ({
        ...prev,
        [account_id]: null,
      }));

      set_end_date_range_filter_by_account((prev) => ({
        ...prev,
        [account_id]: null,
      }));
      set_selected_date_filter_by_account((prev) => ({
        ...prev,
        [account_id]:
          prev?.[account_id] === date_filter_id ? null : date_filter_id,
      }));
    },
    [],
  );

  const start_date_range_filter_select_function = useCallback(
    (account_id, e) => {
      const next_start_date = String(e?.target?.value || "");
      set_start_date_range_filter_by_account((prev) => ({
        ...prev,
        [account_id]: next_start_date,
      }));
      set_selected_date_filter_by_account((prev) => ({
        ...prev,
        [account_id]: null,
      }));
    },
    [],
  );

  const end_date_range_filter_select_function = useCallback((account_id, e) => {
    const next_end_date = String(e?.target?.value || "");
    set_end_date_range_filter_by_account((prev) => ({
      ...prev,
      [account_id]: next_end_date,
    }));
    set_selected_date_filter_by_account((prev) => ({
      ...prev,
      [account_id]: null,
    }));
  }, []);

  const register_account_section_ref = useCallback((account_id, node) => {
    account_row_refs.current[account_id] = node;
  }, []);

  const get_filtered_messages = useCallback(
    (
      account_id,
      account_db_messages,
      selected_date_filter,
      account_selected_keyword_filter,
      selected_start_date_filter,
      selected_end_date_filter,
    ) => {
      let msgs = account_db_messages || [];

      // filter by keywords messages ids
      if (
        account_selected_keyword_filter &&
        account_selected_keyword_filter.length > 0
      ) {
        const filtered_message_ids_set = new Set();
        account_selected_keyword_filter.forEach((k) => {
          const k_msgs_ids =
            account_keywords_mapping_messages?.[account_id]?.[k] || [];
          k_msgs_ids.forEach((msg_id) => filtered_message_ids_set.add(msg_id));
        });
        msgs = msgs.filter((msg) =>
          filtered_message_ids_set.has(String(msg.message_id)),
        );
      }

      //filter by the date filter preset
      if (selected_date_filter) {
        msgs = msgs.filter((msg) => {
          const msg_date = msg?.date;
          if (!msg_date) return true;
          return is_date_in_filter_preset(msg_date, selected_date_filter);
        });
      }

      //filter by specific date range
      if (selected_start_date_filter || selected_end_date_filter) {
        msgs = msgs.filter((msg) => {
          const msg_date = msg?.date;
          if (!msg_date) return true;
          return is_row_in_specific_date_range(
            msg_date,
            selected_start_date_filter,
            selected_end_date_filter,
          );
        });
      }

      // sort by date
      msgs = msgs.sort((left_row, right_row) => {
        const left_time = new Date(left_row?.date).getTime();
        const right_time = new Date(right_row?.date).getTime();

        const safe_left_time = Number.isNaN(left_time) ? -Infinity : left_time;
        const safe_right_time = Number.isNaN(right_time)
          ? -Infinity
          : right_time;

        if (safe_left_time === safe_right_time) {
          const left_message_id = String(left_row?.message_id || "");
          const right_message_id = String(right_row?.message_id || "");
          return right_message_id.localeCompare(left_message_id);
        }

        return safe_right_time - safe_left_time;
      });

      console.log("msgs before datatable filters: ", msgs);

      console.log("msgs: ", msgs);

      return msgs;
    },
    [account_keywords_mapping_messages],
  );

  return (
    <div className={styles.telegram_page_root}>
      <ExtraSideBar
        title="Telegram explorer"
        loading={sidebar_loading}
        items={sidebar_items}
        on_item_click={handle_sidebar_account_click}
        default_open_item_ids={
          telegram_accounts && telegram_accounts.length > 0
            ? [telegram_accounts[0].account_id]
            : []
        }
      />

      <div className={styles.accounts_cards_root}>
        {telegram_accounts.map((account, account_idx) => {
          const account_id = account?.account_id;

          return (
            <AccountSection
              key={account_idx}
              account={account}
              account_idx={account_idx}
              account_section_open={section_open_by_account[account_id]}
              account_senders={senders_by_account[account_id]}
              selected_senders_obj={selected_senders_by_account[account_id]}
              selected_date_filter={selected_date_filter_by_account[account_id]}
              keywords_loading={
                keywords_loading_by_account[account_id] || false
              }
              account_keywords={keywords_by_account[account_id] || []}
              account_selected_keyword_filter={
                selected_keyword_filters_by_account?.[account_id] || null
              }
              keywords_error={keywords_error_by_account?.[account_id]}
              account_db_messages={db_messages_by_account[account_id] || []}
              account_start_date_range_filter={
                start_date_range_filter_by_account[account_id] || null
              }
              account_end_date_range_filter={
                end_date_range_filter_by_account[account_id] || null
              }
              messages_loading={
                db_messages_loading_by_account[account_id] || false
              }
              get_filtered_messages={get_filtered_messages}
              account_keywords_mapping={
                account_keywords_mapping_messages?.[account_id] || {}
              }
              register_account_section_ref={register_account_section_ref}
              toggle_account_section_open={toggle_account_section_open}
              sender_error={senders_error_by_account?.[account_id]}
              db_messages_error={db_messages_error_by_account?.[account_id]}
              senders_loading={senders_loading_by_account[account_id]}
              limits_account={limits_by_account_sender[account_id] || {}}
              sender_limit_change_function={sender_limit_change_function}
              start_date_range_filter_select_function={
                start_date_range_filter_select_function
              }
              end_date_range_filter_select_function={
                end_date_range_filter_select_function
              }
              sender_selected_function={sender_selected_function}
              date_filter_select_function={date_filter_select_function}
              keyword_filter_select_function={keyword_filter_select_function}
            />
          );
        })}
      </div>
    </div>
  );
}
