import { useCallback, useMemo, useRef, useState } from "react";

import { get_emails_by_criteria } from "../../lib/backend/emails";
import { useUserContext } from "../../lib/contexts/UserContext";
import { getFormattedDateTimeValue } from "../../lib/utils/datetime";

import AccountEmailsCard from "./AccountsEmails";
import ExtraSideBar from "../../components/layout_shell/ExtraSideBar";
import EmailContainerPopup from "../../components/page_components/EmailContainerPopup";

import styles from "./Emails.module.scss";

export default function EmailsPage() {
  const { accounts_data, accounts_loading, accounts_error } = useUserContext();
  const [sidebar_emails_by_account, set_sidebar_emails_by_account] = useState({});
  const [sidebar_loading, set_sidebar_loading] = useState(false);
  const [sidebar_loading_by_account, set_sidebar_loading_by_account] = useState({});
  const [is_email_popup_visible, set_is_email_popup_visible] = useState(false);
  const [selected_email_row, set_selected_email_row] = useState(null);
  const [selected_email_account_id, set_selected_email_account_id] = useState(null);
  const account_row_refs = useRef({});

  const email_accounts_data = useMemo(() => {
    return (accounts_data || []).filter(
      (account_data) => account_data?.provider_type === "EMAIL"
    );
  }, [accounts_data]);

  const open_email_popup = useCallback((account_id, email_row) => {
    if (!account_id || !email_row) return;

    set_selected_email_account_id(account_id);
    set_selected_email_row(email_row);
    set_is_email_popup_visible(true);
  }, []);

  const close_email_popup = useCallback(() => {
    set_is_email_popup_visible(false);
    set_selected_email_account_id(null);
    set_selected_email_row(null);
  }, []);

  const fetch_sidebar_emails = useCallback(async () => {
    if (!email_accounts_data?.length) {
      set_sidebar_emails_by_account({});
      set_sidebar_loading_by_account({});
      set_sidebar_loading(false);
      return;
    }

    const account_ids = (email_accounts_data || [])
      .map((account_data) => account_data?.account_id)
      .filter(Boolean);

    const initial_loading_by_account = account_ids.reduce(
      (acc, account_id) => ({
        ...acc,
        [account_id]: true,
      }),
      {}
    );

    set_sidebar_loading(true);
    set_sidebar_loading_by_account(initial_loading_by_account);
    console.log("[EmailsSidebar] loading all emails for sidebar", {
      accounts_count: email_accounts_data.length,
    });

    const settled_results = await Promise.allSettled(
      email_accounts_data.map(async (account_data) => {
        const account_id = account_data?.account_id;
        if (!account_id) {
          return {
            account_id: null,
            items: [],
          };
        }

        try {
          const response = await get_emails_by_criteria(account_id, {}, 1, "ALL");

          return {
            account_id,
            items: Array.isArray(response?.items) ? response.items : [],
          };
        } finally {
          set_sidebar_loading_by_account((prev) => ({
            ...prev,
            [account_id]: false,
          }));
        }
      })
    );

    const next_sidebar_emails_by_account = {};

    settled_results.forEach((result, index) => {
      const account_id = email_accounts_data[index]?.account_id;
      if (!account_id) return;

      if (result.status === "fulfilled") {
        const account_items = Array.isArray(result.value?.items)
          ? result.value.items
          : [];

        next_sidebar_emails_by_account[account_id] = account_items;
        return;
      }

      console.log("[EmailsSidebar] failed loading account emails", {
        account_id,
        error: result.reason,
      });
      next_sidebar_emails_by_account[account_id] = [];
    });

    set_sidebar_emails_by_account(next_sidebar_emails_by_account);
    set_sidebar_loading(false);

    console.log("[EmailsSidebar] sidebar emails loaded", {
      loaded_accounts: Object.keys(next_sidebar_emails_by_account).length,
    });
  }, [email_accounts_data]);

  const extra_sidebar_items = useMemo(() => {
    return (email_accounts_data || []).map((account_data) => {
      const account_id = account_data?.account_id;
      const account_children = (sidebar_emails_by_account[account_id] || []).map(
        (email_item) => ({
          id: email_item?.email_id,
          title: email_item?.sender_signature || "Unknown sender",
          subtitle: email_item?.subject || "",
          badges_values: [getFormattedDateTimeValue(email_item?.date)].filter(
            Boolean
          ),
        })
      );

      return {
        id: account_id,
        label: account_data?.email,
        extralabel: account_data?.email_provider_id,
        is_loading: Boolean(sidebar_loading_by_account[account_id]),
        children: account_children,
      };
    });
  }, [email_accounts_data, sidebar_emails_by_account, sidebar_loading_by_account]);

  const handleAccountSideClick = useCallback((account_id) => {
    fetch_sidebar_emails();

    if (!account_id) return;

    const target_node = account_row_refs.current[account_id];
    if (target_node) {
      target_node.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [fetch_sidebar_emails]);

  const handleSidebarCollapseToggle = useCallback(() => {
    fetch_sidebar_emails();
  }, [fetch_sidebar_emails]);

  const handleEmailSideClick = useCallback((account_id, email_id) => {

    console.log("opening from sidebar, account_id: " , account_id, " email_id: " , email_id);

    if (!account_id || !email_id) return;

    const target_node = account_row_refs.current[account_id];
    if (target_node) {
      target_node.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    const account_emails = Array.isArray(sidebar_emails_by_account[account_id])
      ? sidebar_emails_by_account[account_id]
      : [];

    const selected_email = account_emails.find((email_row) => {
      return (
        String(email_row?.email_id || "") === String(email_id)
      );
    });

    if (!selected_email) {
      console.log("[EmailsSidebar] unable to resolve sidebar email row", {
        account_id,
        email_id,
      });
      return;
    }
    console.log("selected email: " , selected_email);
    open_email_popup(account_id, selected_email);
  }, [open_email_popup, sidebar_emails_by_account]);

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

  if (!email_accounts_data?.length) {
    return <div className={styles.page_state}>No accounts found.</div>;
  }

  return (
    <div className={styles.emails_root}>
      <ExtraSideBar
        title={sidebar_loading ? "Emails Explorer (loading...)" : "Emails Explorer"}
        items={extra_sidebar_items}
        on_item_click={handleAccountSideClick}
        on_child_click={handleEmailSideClick}
        on_collapse_toggle={handleSidebarCollapseToggle}

      />

      <div className={styles.accounts_cards_root}>
        {email_accounts_data.map((account_data) => {

          return (
            <div
              key={account_data.account_id || account_data.email}
              ref={(node) => {
                account_row_refs.current[account_data.account_id] = node;
              }}
            >
              <AccountEmailsCard
                account_data={account_data}
                on_email_click={open_email_popup}
              />
            </div>
          );
        })}
      </div>

      <EmailContainerPopup
        is_visible={is_email_popup_visible}
        close_popup={close_email_popup}
        account_id={selected_email_account_id}
        email_row={selected_email_row}
      />
    </div>
  );
}
