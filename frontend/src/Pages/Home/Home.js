import UserApplicationCard from "./UserApplicationCard";
import UserDatasetsCard from "./UserDatasetsCard";

import UserKeysCard from "./UserKeysCard";
import UserAccountsCard from "./UserAccountsCard";

import styles from "./Home.module.scss";
import { useAuth } from "../../lib/contexts/AuthContext";
import { useUserContext } from "../../lib/contexts/UserContext";

export default function Home() {
  const {
    accounts_data,
    accounts_loading,
    refreshAccounts,
    datasets_data,
    datasets_loading,
    refreshDatasets,
  } = useUserContext();

  const { user_app } = useAuth();

  return (
    <div className={styles.root_home}>
      <div className={styles.home_overview_grid}>
        <section className={`${styles.home_card} `}>
          <UserApplicationCard
            user_app={user_app}
            user_ds_num={datasets_data?.length}
            user_accounts_num={accounts_data?.length}
            datasets_loading={datasets_loading}
            accounts_loading={accounts_loading}
          />
        </section>

          <UserDatasetsCard
            datasets_data={datasets_data}
            refresh_datasets={refreshDatasets}
          />

        <section
          className={`${styles.home_card} ${styles.accounts_card_container}`}
        >
          <UserAccountsCard
            accounts_data={accounts_data}
            refresh_data={refreshAccounts}
            loading={accounts_loading}
          />
        </section>

        <section className={`${styles.home_card} ${styles.user_keys_card}`}>
          <UserKeysCard />
        </section>
      </div>
    </div>
  );
}
