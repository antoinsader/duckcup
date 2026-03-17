import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Button from "../../components/reusable/Button/Button";
import TextInput from "../../components/reusable/Inputs/TextInput";

import { useAuth } from "../../lib/contexts/AuthContext";

import { login_user, register_user } from "../../lib/backend/user";

import styles from "./Login.module.scss";
import { clearEmailsMemoryCache } from "../../lib/cache/emails_memory_cache";

export default function Login() {
  const { user_app, authenticated, refreshAuth, loading_auth } = useAuth();
  const [username, set_username] = useState("");
  const [password, set_password] = useState("");
  const [show_register, set_show_register] = useState(false);

  const [login_error, set_login_error] = useState();
  const [login_loading, set_login_loading] = useState(false);

  useEffect(() => {
    set_login_error(null);
  }, [show_register]);

  const register = async () => {
    if (login_loading) return;
    set_login_loading(true);
    set_login_error();
    const res = await register_user(username, password);
    if (res && res.user_id) {
      refreshAuth();
    } else {
      toast.error("Register error");
      set_login_error(`Register error:  ${res}`);
    }
    set_login_loading(false);
  };

  const login_normal = async () => {
    if (login_loading) return;
    set_login_loading(true);
    set_login_error();
    const logged_user = await login_user(username, password);
        clearEmailsMemoryCache();
    

    if (logged_user && logged_user.user_id) {
      refreshAuth();
    } else {
      toast.error("Login error");
      set_login_error(`Login error: ${logged_user}`);
    }
    set_login_loading(false);
  };

  return (
    <div className={styles.login_page_root}>
      <div className={styles.login_card}>
        <h1> Welcome to DuckCup </h1>
        <p>Once you login, you can use our services.</p>
        {loading_auth ? (
          <div className="spinner"></div>
        ) : (
          <>
            {authenticated && user_app ? (
              <p className="warning_note">
                You are logged in as {user_app.username}.{" "}
              </p>
            ) : (
              <>
                <h3> {show_register ? "Register" : "Login"} </h3>
                <TextInput
                  name="username"
                  label="Username"
                  value={username}
                  onChange={set_username}
                />
                <TextInput
                  type="password"
                  name="password"
                  label="Password"
                  value={password}
                  onChange={set_password}
                />
                {login_error && <p className="error_note"> {login_error}</p>}

                {show_register ? (
                  <div className="d-flex flex-column">
                    <Button onClick={register} loading={login_loading}>
                      <span> Register </span>
                    </Button>
                    <div className="d-flex flex-gap-05">
                      <span>already have an account? </span>
                      <Button
                        size="text"
                        onClick={() => set_show_register(false)}
                      >
                        Login{" "}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex flex-column">
                    <Button onClick={login_normal} loading={login_loading}>
                      <span> Login </span>
                    </Button>
                    <div className="d-flex flex-gap-05">
                      <span>don't have an account? </span>
                      <Button
                        size="text"
                        onClick={() => set_show_register(true)}
                      >
                        Register{" "}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
