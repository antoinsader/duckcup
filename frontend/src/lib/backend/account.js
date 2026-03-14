import { apiRequest } from "../api/api";



export const get_user_accounts =async () => {
  // Return accounts array, each account_id, email, email_provider_id, inbox_count
  const user_accounts = await apiRequest({
    route: "account/get_user_accounts",
  });
  return user_accounts;
}

export const add_account =async (provider_id) => {
  // returns redirec response
  const add_acc_res = await apiRequest({
    route: "account/login_with_provider",
    body: {provider_id}
  });
  return add_acc_res;
}



export const delete_user_account =async (account_id) => {
  // returns {success: bool}
  const del_res = await apiRequest({
    route: "account/delete_account",
    body: {account_id}
  });
  return del_res;
}


export const login_with_google = () => {
    window.location.href = process.env.REACT_APP_LOGIN_GOOGLE_ROUTE;
  };