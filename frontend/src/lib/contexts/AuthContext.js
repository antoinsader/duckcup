import {
  createContext,
  useState,
  useContext,
  useEffect,
} from "react";
import { apiRequest } from "../api/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authenticated, set_authenticated] = useState(false);
  const [user_app, set_user_app] = useState(null);
  const [loading_auth, set_loading_auth] = useState(true);

  const get_user = async () => {
    set_loading_auth(true);
    set_authenticated(false);
    set_user_app(null);

    try {
      const data = await apiRequest({
        method: "GET",
        route: "user/me",
        silence_error_handling: true,
      });
      if(data && data.user_id){
        set_authenticated(true);
        set_user_app(data);
      }

    } catch (ex) {
    } finally {
      set_loading_auth(false);
    }
  };


  useEffect(() => {
    get_user();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        loading_auth,
        user_app,
        authenticated,
        refreshAuth: get_user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  //Expose loading_auth, user_app, authenticated, refreshAuth
  return useContext(AuthContext);
}
