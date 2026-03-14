import { createContext, useContext, useState, useEffect, useCallback } from "react";

import { get_user_accounts } from "../backend/account";
import { get_user_datasets } from "../backend/dataset";
import { useAuth } from "./AuthContext";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const { authenticated, loading_auth } = useAuth();

  const [accounts_data, set_accounts_data] = useState([]);
  const [accounts_loading, set_accounts_loading] = useState(true);
  const [accounts_error, set_accounts_error] = useState("");

  const [datasets_data, set_datasets_data] = useState([]);
  const [datasets_loading, set_datasets_loading] = useState(true);
  const [datasets_error, set_datasets_error] = useState("");

  const refreshAccounts = useCallback(async () => {
    set_accounts_loading(true);
    set_accounts_error("");

    try {
      const res = await get_user_accounts();
      if (Array.isArray(res)) {
        set_accounts_data(res);
      } else {
        set_accounts_data([]);
        set_accounts_error("Unexpected response from server");
        console.error("get_user_accounts returned", res);
      }
    } catch (ex) {
      set_accounts_data([]);
      set_accounts_error("Unable to load accounts");
      console.error(ex);
    } finally {
      set_accounts_loading(false);
    }
  }, []);

  const refreshDatasets = useCallback(async () => {
    set_datasets_loading(true);
    set_datasets_error("");

    try {
      const res = await get_user_datasets();
      if (Array.isArray(res)) {
        set_datasets_data(res);
      } else {
        set_datasets_data([]);
        set_datasets_error("Unexpected response from server");
        console.error("get_user_datasets returned", res);
      }
    } catch (ex) {
      set_datasets_data([]);
      set_datasets_error("Unable to load datasets");
      console.error(ex);
    } finally {
      set_datasets_loading(false);
    }
  }, []);

  useEffect(() => {
    if (loading_auth) return;

    if (!authenticated) {
      set_accounts_data([]);
      set_accounts_error("");
      set_accounts_loading(false);

      set_datasets_data([]);
      set_datasets_error("");
      set_datasets_loading(false);
      return;
    }

    refreshAccounts();
    refreshDatasets();
  }, [authenticated, loading_auth, refreshAccounts, refreshDatasets]);

  return (
    <UserContext.Provider
      value={{
        accounts_loading,
        accounts_data,
        accounts_error,
        refreshAccounts,
        datasets_loading,
        datasets_data,
        datasets_error,
        refreshDatasets,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  return useContext(UserContext);
}
