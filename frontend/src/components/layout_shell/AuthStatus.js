import { useAuth } from "../../lib/contexts/AuthContext";
import styles from "./Layout.module.scss";

const AuthStatus = () => {
  const { authenticated: is_authenticated, loading_auth: loading, user_app } = useAuth();

  return (
    <div className={styles.status_wrapper}>
      <div
        className={`${styles.status_badge} ${
          is_authenticated ? styles.online : styles.offline
        }`}
      >
        User: :
        {loading ? (
          <span className="spinner"></span>
        ) : (
          <>
            <span className={styles.status_text}>
              {is_authenticated ? user_app.username : "Not authenticated"}
            </span>
            <span className={styles.status_dot} />
          </>
        )}
      </div>
    </div>
  );
};

export default AuthStatus;