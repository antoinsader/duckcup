import { apiRequest } from "../api/api";

export const get_saved_keys = async () => {
  const keys_res = await apiRequest({
    route: "secretes/get_saved_keys",
  });
  return keys_res;
};

export const get_rsa_public_key = async () => {
  const public_key_res = await apiRequest({
    method: "GET",
    route: "secretes/get_rsa_public_key",
  });
  return public_key_res;
};

export const save_encrypted_key = async (set_route, encrypted_key) => {
  const save_res = await apiRequest({
    route: `secretes/${set_route}`,
    body: { encrypted_key },
  });
  return save_res;
};

export const delete_saved_key = async (delete_route) => {
  const delete_res = await apiRequest({
    route: `secretes/${delete_route}`,
  });
  return delete_res;
};
