
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AiOutlineRobot } from "react-icons/ai";
import { FiRefreshCcw } from "react-icons/fi";

import {
  build_emails_page_cache_key,
  get_cache_minutes_ago,
  get_meta_from_memory_cache,
  get_page_from_memory_cache,
  set_meta_in_memory_cache,
  set_page_in_memory_cache,
} from "../../lib/cache/emails_memory_cache";

import { get_email_columns } from "../../lib/config/common_columns";
import { get_emails_by_criteria, get_inbox_meta } from "../../lib/backend/emails";
import Section from "../../components/reusable/Section/Section";
import DataTable from "../../components/reusable/Datatable/Datatable";
import SaveInboxPopup from "./SaveInboxPopup";
import EmailCriteria from "./EmailCriteria";

import styles from "./Emails.module.scss";
import { FaMagic } from "react-icons/fa";


export default function AccountEmailsCard({ account_data, on_email_click }) {
  const [emails_loading, set_emails_loading] = useState(false);
  const [emails_data, set_emails_data] = useState([]);
  const [pagination_data, set_pagination_data] = useState({
    page_num: 1,
    num_rows: 50,
    total_rows: 0,
  });
  const [emails_cache_info, set_emails_cache_info] = useState({
    is_from_cache: false,
    cached_at: null,
  });

  const [meta_loading, set_meta_loading] = useState(false);
  const [meta_data, set_meta_data] = useState({});

  const [criteria_data, set_criteria_data] = useState({
    sort_by: "newest_first",
  });
  const [is_save_popup_visible, set_is_save_popup_visible] = useState(false);
  const has_loaded_meta_ref = useRef(false);
  const has_loaded_initial_emails_ref = useRef(false);

  const account_id = account_data?.account_id;
  const account_email = account_data?.email;
  const inbox_count = account_data?.inbox_count ?? 0;

  const fetch_meta = useCallback(
    async ({ force_refresh = false } = {}) => {
      if (!account_id) return;

      if (!force_refresh) {
        const cached_meta = get_meta_from_memory_cache(account_id);
        if (cached_meta?.data) {
          console.log("[EmailsCache] metadata cache hit", {
            account_id,
            cached_at: cached_meta.cached_at,
          });
          set_meta_data(cached_meta.data || {});
          return;
        }

        console.log("[EmailsCache] metadata cache miss or expired", {
          account_id,
        });
      } else {
        console.log("[EmailsCache] metadata refresh forced", {
          account_id,
        });
      }

      set_meta_loading(true);
      const res = await get_inbox_meta(account_id);
      const resolved_meta = res || {};

      set_meta_data(resolved_meta);
      set_meta_in_memory_cache(account_id, resolved_meta);
      set_meta_loading(false);
    },
    [account_id]
  );

  const fetch_emails_page = useCallback(
    async ({
      page_num,
      num_rows,
      force_refresh = false,
      criteria_override = null,
    }) => {
      if (!account_id) return;

      const resolved_criteria = criteria_override || criteria_data || {};

      const emails_cache_key = build_emails_page_cache_key({
        account_id,
        page_num,
        num_rows,
        criteria_data: resolved_criteria,
      });

      if (!force_refresh) {
        const cached_page_entry = get_page_from_memory_cache(
          account_id,
          emails_cache_key
        );

        if (cached_page_entry) {
          console.log("[EmailsCache] emails page cache hit", {
            account_id,
            page_num,
            num_rows,
            emails_cache_key,
            cached_at: cached_page_entry.cached_at,
          });

          set_emails_data(
            Array.isArray(cached_page_entry.rows) ? cached_page_entry.rows : []
          );
          set_pagination_data((prev_state) => ({
            ...prev_state,
            page_num: Number(cached_page_entry.page_num) || page_num,
            num_rows: Number(cached_page_entry.num_rows) || num_rows,
            total_rows: Number(cached_page_entry.total_rows) || 0,
          }));
          set_emails_cache_info({
            is_from_cache: true,
            cached_at: cached_page_entry.cached_at,
          });

          return;
        }

        console.log("[EmailsCache] emails page cache miss or expired", {
          account_id,
          page_num,
          num_rows,
          emails_cache_key,
        });
      } else {
        console.log("[EmailsCache] emails page refresh forced", {
          account_id,
          page_num,
          num_rows,
          emails_cache_key,
        });
      }

      set_emails_loading(true);

      const res = await get_emails_by_criteria(
        account_id,
        resolved_criteria,
        page_num,
        num_rows
      );

      const rows = Array.isArray(res?.items) ? res.items : [];
      const total_rows = Number(res?.total_count) || 0;
      const resolved_page_num = Number(res?.page_num) || page_num;
      const resolved_num_rows = Number(res?.num_rows) || num_rows;

      set_emails_data(rows);
      set_pagination_data((prev_state) => ({
        ...prev_state,
        page_num: resolved_page_num,
        num_rows: resolved_num_rows,
        total_rows,
      }));

      set_page_in_memory_cache(account_id, emails_cache_key, {
        rows,
        total_rows,
        page_num: resolved_page_num,
        num_rows: resolved_num_rows,
      });

      set_emails_cache_info({
        is_from_cache: false,
        cached_at: new Date().toISOString(),
      });

      set_emails_loading(false);
    },
    [account_id, criteria_data]
  );

  const get_emails = useCallback(async (next_criteria_data = null) => {
    await fetch_emails_page({
      page_num: 1,
      num_rows: pagination_data.num_rows || 50,
      criteria_override: next_criteria_data,
    });
  }, [fetch_emails_page, pagination_data.num_rows]);

  const handle_refresh = useCallback(async () => {
    const page_num = pagination_data.page_num || 1;
    const num_rows = pagination_data.num_rows || 50;

    console.log("[EmailsCache] manual refresh clicked", {
      account_id,
      page_num,
      num_rows,
    });

    await Promise.all([
      fetch_meta({ force_refresh: true }),
      fetch_emails_page({ page_num, num_rows, force_refresh: true }),
    ]);
  }, [account_id, fetch_emails_page, fetch_meta, pagination_data.num_rows, pagination_data.page_num]);

  const open_save_popup = useCallback(() => {
    set_is_save_popup_visible(true);
  }, []);

  const close_analyze_popup = useCallback(() => {
    set_is_save_popup_visible(false);
  }, []);

  const total_emails_for_dataset = useMemo(() => {
    return Number(pagination_data.total_rows) || Number(inbox_count) || 0;
  }, [inbox_count, pagination_data.total_rows]);

  const custom_btns = useMemo(
    () => [
      {
        key: `refresh_${account_id}`,
        label: "Refresh",
        icon: <FiRefreshCcw />,
        onClick: handle_refresh,
        class: "secondary",
        hide: false,
      },
      {
        key: `analyze_ai_${account_id}`,
        label: "Save dataset",
        icon: <FaMagic />,
        onClick: open_save_popup,
        class: "primary",
        hide: false,
      },
    ],
    [account_id, handle_refresh, open_save_popup]
  );

  const handle_pagination_change = useCallback(
    ({ page_num, num_rows }) => {
      fetch_emails_page({ page_num, num_rows });
    },
    [fetch_emails_page]
  );

  const handle_email_row_click = useCallback((email_row) => {
    if (!email_row) return;
    on_email_click?.(account_id, email_row);
  }, [account_id, on_email_click]);

  useEffect(() => {
    const get_meta = async () => {
      if (!account_id || has_loaded_meta_ref.current) return;

      has_loaded_meta_ref.current = true;
      await fetch_meta();
    };

    get_meta();
  }, [account_id, fetch_meta]);

  useEffect(() => {
    const get_initial_emails = async () => {
      if (!account_id || has_loaded_initial_emails_ref.current) return;

      has_loaded_initial_emails_ref.current = true;
      await fetch_emails_page({
        page_num: 1,
        num_rows: pagination_data.num_rows || 50,
      });
    };

    get_initial_emails();
  }, [account_id, fetch_emails_page, pagination_data.num_rows]);


  const cache_minutes_ago = useMemo(() => {
    return get_cache_minutes_ago(emails_cache_info.cached_at);
  }, [emails_cache_info.cached_at]);

  const emails_subtitle = useMemo(() => {
    if (emails_loading) return "loading";

    const source_text = emails_cache_info.is_from_cache ? "Cache" : "Server";
    const cache_age_text =
      cache_minutes_ago === null
        ? "not cached yet"
        : `${cache_minutes_ago} min ago`;

    return `Page ${pagination_data.page_num || 1} • ${
      pagination_data.num_rows || 50
    } rows/page • Total ${pagination_data.total_rows || 0} • Source: ${source_text} • Cached: ${cache_age_text}`;
  }, [
    emails_loading,
    cache_minutes_ago,
    emails_cache_info.is_from_cache,
    pagination_data.num_rows,
    pagination_data.page_num,
    pagination_data.total_rows,
  ]);

  const columns = useMemo(() => get_email_columns(), []);

  const section_header = (
    <div className={styles.account_header_content}>
      <h2 className={styles.account_title}>{account_email || "Account"}</h2>
      <span className={styles.account_subtitle}>Inbox count: {inbox_count}</span>
    </div>
  );

  const section_content = (
    <>
  <div className={styles.criteria_wrapper}>
        <EmailCriteria
          meta_data={meta_data}
          meta_loading={meta_loading}
          get_emails={get_emails}
          criteria_data={criteria_data}
          set_criteria_data={set_criteria_data}
        />
      </div>

      <DataTable
        className={styles.datatable_root}
        columns={columns}
        data={emails_data}
        loading={emails_loading}
        server_pagination={true}
        total_rows={pagination_data.total_rows}
        current_page_num={pagination_data.page_num}
        current_num_rows={pagination_data.num_rows}
        on_pagination_change={handle_pagination_change}
        row_click={handle_email_row_click}
        title="Inbox Emails"
        subtitle={emails_subtitle}
        customBtns={custom_btns}
      />

      <SaveInboxPopup
        is_visible={is_save_popup_visible}
        close_popup={close_analyze_popup}
        account_id={account_id}
        criteria_data={criteria_data}
        total_emails_for_dataset={total_emails_for_dataset}
      />
      
    </>
  );

  return (
    <Section
      section_header={section_header}
      section_content={section_content}
      default_open={true}
    />
  );
}
