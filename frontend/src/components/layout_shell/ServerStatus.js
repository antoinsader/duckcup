import React, { useEffect, useState } from "react";
import { read_server_status } from "../../lib/backend/api";

import styles from "./Layout.module.scss";
import { BiRefresh } from "react-icons/bi";

const ServerStatus = () => {
  const [loading, set_loading] = useState(false);
  const [is_online, set_is_online] = useState(false);

  const get_ser_st = async () => {
    set_loading(true);
    try {
      const status = await read_server_status();
      set_is_online(status);
    } finally {
      set_loading(false);
    }
  };

  useEffect(() => {
    get_ser_st();
  }, []);

  return (
    <div className={styles.status_wrapper}>
      <div
        className={`${styles.status_badge} ${
          is_online ? styles.online : styles.offline
        }`}
      >
        Server:
        {loading ? (
          <span className="spinner"></span>
        ) : (
          <>
            <span className={styles.status_text}>
              {is_online ? "Online" : "Offline or busy"}
            </span>
            <span className={styles.status_dot} />

            <div
              className={styles.refresh_btn}
              onClick={get_ser_st}
              aria-label="Refresh server status"
            >
              <BiRefresh />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ServerStatus;
