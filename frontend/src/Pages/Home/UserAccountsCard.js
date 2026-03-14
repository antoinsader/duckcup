import React, { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import Popup from "../../components/reusable/Popup/Popup";
import ConfirmPopup from "../../components/reusable/Popup/ConfirmPopup";
import AuthPopup from "./AuthPopup";

import { delete_user_account, add_account } from "../../lib/backend/account";
import { get_email_login_providers } from "../../lib/backend/meta";
import { useCommandListener } from "../../lib/contexts/CommandContext";
import { COMMAND_IDS } from "../../config/commands";

import styles from "./Home.module.scss";
export default function UserAccountsCard({
  accounts_data,
  refresh_data,
  loading,
}) {
  const navigate = useNavigate();
  const [show_delete_confirm, set_show_delete_confirm] = useState(false);
  const [row_to_delete, set_row_to_delete] = useState(null);
  const [is_deleting_account, set_is_deleting_account] = useState(false);
  const [search_query, set_search_query] = useState("");

  const [add_popup_visible, set_add_popup_visible] = useState(false);
  const [email_providers, set_email_providers] = useState([]);
  const [providers_loading, set_providers_loading] = useState(false);
  const [adding, set_adding] = useState(false);
  const [auth_popup_visible, set_auth_popup_visible] = useState(false);
  const [auth_provider, set_auth_provider] = useState(null);
  const [auth_redirect_url, set_auth_redirect_url] = useState("");

  // Listen for "add account" command from navbar search
  useCommandListener(COMMAND_IDS.ADD_ACCOUNT, () => {
    set_add_popup_visible(true);
  });

  const delete_account = useCallback(
    async (row) => {
      if (!row?.account_id || is_deleting_account) return;

      set_is_deleting_account(true);
      try {
        const del_res = await delete_user_account(row.account_id);
        if (del_res?.success) {
          toast.success("Account deleted successfully");
          await refresh_data();
          set_show_delete_confirm(false);
          set_row_to_delete(null);
        } else {
          toast.error("Error deleting account");
        }
      } catch (ex) {
        toast.error("Error deleting account");
      } finally {
        set_is_deleting_account(false);
      }
    },
    [is_deleting_account, refresh_data],
  );

  const loadProviders = useCallback(async () => {
    set_providers_loading(true);
    try {
      const provs = await get_email_login_providers();
      const providers_list = Array.isArray(provs) ? provs : [];
      set_email_providers(providers_list);
      return providers_list;
    } catch (ex) {
      console.error(ex);
      toast.error("Unable to load providers");
      return [];
    } finally {
      set_providers_loading(false);
    }
  }, []);

  const handleAdd = useCallback(async (provider) => {
    if (!provider?.id) {
      toast.error("Invalid provider");
      return;
    }

    set_adding(true);
    try {
      const res = await add_account(provider.id);
      if (provider.auth_flow === "oauth_redirect" && res?.redirect_url) {
        window.location.href = res.redirect_url;
        return;
      }
      if (provider.auth_flow === "staged_credentials" && res?.redirect_url) {
        set_auth_provider(provider);
        set_auth_redirect_url(res.redirect_url);
        set_auth_popup_visible(true);
        set_add_popup_visible(false);
      } else {
        console.error("Unexpected provider auth flow or missing redirect_url", {
          provider,
          res,
        });
        toast.error("Error adding account");
      }
    } catch (ex) {
      console.error(ex);
      toast.error("Error adding account");
    } finally {
      set_adding(false);
    }
  }, []);

  const handleRelogin = useCallback(
    async (account) => {
      if (adding || !account?.email_provider_id) return;

      let matched_provider = email_providers.find(
        (provider) => String(provider.id) === String(account.email_provider_id),
      );

      if (!matched_provider) {
        const providers_list = await loadProviders();
        matched_provider = providers_list.find(
          (provider) =>
            String(provider.id) === String(account.email_provider_id),
        );
      }

      if (!matched_provider) {
        console.error("Provider not found for re-login", {
          account,
          email_providers,
        });
        toast.error("Unable to find provider for re-login");
        return;
      }

      if (matched_provider.auth_flow === "oauth_redirect") {
        if (matched_provider.relogin_route) {
          window.location.href = matched_provider.relogin_route;
          return;
        }

        await handleAdd(matched_provider);
        return;
      }

      if (matched_provider.auth_flow === "staged_credentials") {
        if (!matched_provider.relogin_route) {
          toast.error("Missing re-login route for provider");
          return;
        }

        set_auth_provider(matched_provider);
        set_auth_redirect_url(matched_provider.relogin_route);
        set_auth_popup_visible(true);
        set_add_popup_visible(false);
        return;
      }

      toast.error("Unsupported provider auth flow");
    },
    [adding, email_providers, handleAdd, loadProviders],
  );

  const closeAuthPopup = useCallback(() => {
    set_auth_popup_visible(false);
    set_auth_provider(null);
    set_auth_redirect_url("");
  }, []);

  const handleAuthSuccess = useCallback(async () => {
    closeAuthPopup();
    set_add_popup_visible(false);
    await refresh_data();
  }, [closeAuthPopup, refresh_data]);

  const getProviderTypeValue = useCallback((row) => {
    return String(row?.provider_type || "")
      .trim()
      .toUpperCase();
  }, []);

  const provider_by_id = useMemo(() => {
    return email_providers.reduce((acc, provider) => {
      acc[String(provider.id)] = provider;
      return acc;
    }, {});
  }, [email_providers]);

  const getProviderForAccount = useCallback(
    (account) => provider_by_id[String(account?.email_provider_id)] || null,
    [provider_by_id],
  );

  const handleSearchChange = useCallback((event) => {
    set_search_query(event.target.value);
  }, []);

  const handleNavigate = useCallback(
    (row) => {
      const provider_type = getProviderTypeValue(row);

      if (provider_type === "EMAIL") {
        navigate("/emails");
        return;
      }

      if (provider_type === "MESSAGING") {
        navigate("/entities");
      }
    },
    [getProviderTypeValue, navigate],
  );

  useEffect(() => {
    if (add_popup_visible) {
      loadProviders();
    }
  }, [add_popup_visible, loadProviders]);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  const filtered_accounts = useMemo(() => {
    const query = search_query.trim().toLowerCase();
    if (!query) return accounts_data || [];

    return (accounts_data || []).filter((account) => {
      const provider = getProviderForAccount(account);
      const values = [
        account?.email,
        account?.provider_type,
        account?.email_provider_id,
        account?.inbox_count,
        account?.need_to_login ? "yes" : "no",
        provider?.label,
        provider?.provider_type,
      ];

      return values
        .map((value) => String(value || "").toLowerCase())
        .some((value) => value.includes(query));
    });
  }, [accounts_data, getProviderForAccount, search_query]);

  const providerButtons = useMemo(() => {
    return email_providers.map((p) => (
      <button
        key={p.id}
        className={styles.provider_card}
        onClick={() => handleAdd(p)}
        disabled={adding}
      >
        <div className={styles.provider_card_inner}>
          {p.icon ? (
            <img
              src={p.icon}
              alt={`${p.label} icon`}
              className={styles.provider_icon}
              loading="lazy"
            />
          ) : null}
          <div className={styles.provider_label}>{p.label}</div>
        </div>
      </button>
    ));
  }, [email_providers, handleAdd, adding]);

  return (
    <>
        <div className={styles.accounts_header}>
          <div className={styles.accounts_title_group}>
            <h2>User&apos;s accounts</h2>
          </div>

          <div className={styles.accounts_search_actions}>
            <input
              type="text"
              placeholder="Search..."
              className={styles.accounts_search_input}
              value={search_query}
              onChange={handleSearchChange}
            />

            <button
              className="btn primary"
              onClick={() => set_add_popup_visible(true)}
              disabled={loading}
            >
              Add an account
            </button>
          </div>
        </div>

        {loading ? (
          <div className={styles.account_loading}>Loading accounts...</div>
        ) : filtered_accounts.length === 0 ? (
          <div className={styles.account_empty}>No matching data found</div>
        ) : (
          <div className={styles.accounts_list}>
            {filtered_accounts.map((account) => {
              const provider = getProviderForAccount(account);
              const provider_type = getProviderTypeValue(account);

              return (
                <article
                  key={account.account_id}
                  className={`${styles.account_card} ${
                    account.need_to_login ? styles.account_card_need_login : ""
                  }`.trim()}
                >
                  <div className={styles.account_card_top}>
                    <div className={styles.provider_meta}>
                      {provider?.icon ? (
                        <img
                          src={provider.icon}
                          alt={`${provider.label || "Provider"} icon`}
                          className={styles.provider_icon}
                          loading="lazy"
                        />
                      ) : null}

                      <div>
                        <div className={styles.account_email}>
                          {account.email}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`${styles.account_delete_btn} thirdy`}
                      onClick={() => {
                        set_row_to_delete(account);
                        set_show_delete_confirm(true);
                      }}
                      title="Delete account"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  <div className={styles.account_chip_row}>
                    <span className={styles.account_chip}>
                      Provider type: {account.email_provider_id || "Unknown"}
                    </span>
                    {account.inbox_count && account.inbox_count > 0 ?  (
                      <span className={styles.account_chip}>
                        Inbox: {account.inbox_count}
                      </span>
                    ) : ""}
                    <span className={styles.account_chip}>
                      Need re-login: {account.need_to_login ? "Yes" : "No"}
                    </span>
                  </div>

                  <div className={styles.account_actions}>
                    {account.need_to_login ? (
                      <button
                        className="btn primary"
                        onClick={() => handleRelogin(account)}
                        disabled={adding}
                      >
                        Re-login
                      </button>
                    ) : null}

                    {(provider_type === "EMAIL" ||
                      provider_type === "MESSAGING") && (
                      <button
                        className="btn primary"
                        onClick={() => handleNavigate(account)}
                      >
                        {provider_type === "EMAIL"
                          ? "go to emails"
                          : "go to entities"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

      {show_delete_confirm && (
        <ConfirmPopup
          title="Delete account"
          message="Are you sure you want to delete the account ?"
          yes_label="Yes, delete"
          yes_function={() => delete_account(row_to_delete)}
          yes_loading={is_deleting_account}
          close_function={() => set_show_delete_confirm(false)}
        />
      )}

      <Popup
        title="Add account"
        isVisible={add_popup_visible}
        closePopup={() => set_add_popup_visible(false)}
      >
        {providers_loading ? (
          <div>Loading providers...</div>
        ) : (
          <div className={styles.provider_buttons}>{providerButtons}</div>
        )}
        <div className={styles.popup_footer}>
          <button
            className="btn"
            onClick={() => set_add_popup_visible(false)}
            disabled={adding}
          >
            Cancel
          </button>
        </div>
      </Popup>

      <AuthPopup
        is_visible={auth_popup_visible}
        close_popup={closeAuthPopup}
        provider={auth_provider}
        provider_redirect_url={auth_redirect_url}
        on_success={handleAuthSuccess}
      />
    </>
  );
}
