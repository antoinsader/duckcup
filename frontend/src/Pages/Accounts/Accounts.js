import React, { useMemo } from "react";

import { useUserContext } from "../../lib/contexts/UserContext";
import UserAccountsCard from "../Home/UserAccountsCard";

import styles from "./Accounts.module.scss";

export default function Accounts() {
  const { accounts_data, accounts_loading, accounts_error, refreshAccounts } =
    useUserContext();

  const memoAccounts = useMemo(() => accounts_data, [accounts_data]);

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>My Accounts</h1>

      {accounts_error && <div className={styles.error}>{accounts_error}</div>}

      <UserAccountsCard
        accounts_data={memoAccounts}
        loading={accounts_loading}
        refresh_data={refreshAccounts}
      />
    </div>
  );
}
