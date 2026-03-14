import Button from "../../components/reusable/Button/Button";

import styles from "./Home.module.scss";

export default function UserApplicationCard({
  user_app,
  user_ds_num,
  user_accounts_num,
  datasets_loading,
  accounts_loading,
}) {
  return (
    <>
      <h1> Application user info: </h1>

      <span className={`${styles.status_badge} ${styles.active}`}>Online</span>
      <p>
        <b> Username: </b> {user_app?.username}
      </p>
      <p>
        <b> Number of dataset: </b>{" "}
        {datasets_loading ? (
          <span className="spinner"> </span>
        ) : (
          user_ds_num || 0
        )}
      </p>
      <p>
        <b> Number of accounts: </b>{" "}
        {accounts_loading ? (
          <span className="spinner"> </span>
        ) : (
          user_accounts_num || 0
        )}
      </p>
      <div className="code_divider" />

    </>
  );
}
