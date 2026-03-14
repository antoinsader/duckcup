import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Button from "../../components/reusable/Button/Button";
import { logout_user } from "../../lib/backend/user";
import { clearEmailsMemoryCache } from "../../lib/cache/emails_memory_cache";
import { useAuth } from "../../lib/contexts/AuthContext";
import { useCommandListener } from "../../lib/contexts/CommandContext";

import styles from "./Profile.module.scss";
import { COMMAND_IDS } from "../../config/commands";

export default function Profile() {
  const navigate = useNavigate();
  const [is_loading, set_is_loading] = useState(false);
  const { user_app, refreshAuth } = useAuth();

  const handleLogout = async () => {
    set_is_loading(true);

    const logout_res = await logout_user();

    if (logout_res?.error) {
      toast.error(logout_res.error);
      set_is_loading(false);
      return;
    }

    clearEmailsMemoryCache();
    await refreshAuth();
    toast.success("Logged out successfully");
    navigate("/login");
    set_is_loading(false);
  };

  // Listen for "add account" command from navbar search
  useCommandListener(COMMAND_IDS.LOGOUT, () => {
    handleLogout(true);
  });

  return (
    <div className={styles.profile_root}>
      <div className={styles.profile_card}>
        <h1>Profile</h1>

        <span className={`${styles.status_badge} ${styles.active}`}>
          Connected
        </span>

        <p>
          <b>Username:</b> {user_app?.username || "Unknown user"}
        </p>

        <p>
          <b>Account status:</b> Active session
        </p>

        <div className={styles.code_divider} />

        <Button onClick={handleLogout} loading={is_loading} variant="secondary">
          Logout
        </Button>
      </div>
    </div>
  );
}
