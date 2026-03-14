import { apiRequest } from "../api/api";



export async function login_user(username, password) {
  // Return user or null
  const login_res = await apiRequest({
    route: "user/login",
    body: { username, password },
  });
  return login_res;
}

export async function register_user(username, password){
  // Return user or null
  const register_res = await apiRequest({
    route: "user/register",
    body: { username, password },
  });
  return register_res;
}

export async function logout_user(){
  // Return redirect response json
  const register_res = await apiRequest({
    route: "user/logout",
  });
  return register_res;
}
