import {  apiRequest } from "../api/api";

export const get_email_login_providers =async () => {
  // Return providers array, each id, label, provider_type, auth_flow, icon, relogin_route
  const providers = await apiRequest({
    method: "GET",
    route: "meta/login_providers",
  });
  return providers;
}



export const get_embedders_types = async () => {
  const res = await apiRequest({
    method: "GET",
    route: "meta/embedders_types",
  });

  //returns list of embedders: each {id, label, description, is_available, is_default, external_models_url, default_model}
  return res.embedders_types;

}


export const get_hf_text_models = async () => {
  // array [{id, downloads}, ..]
  const res = await apiRequest({
    method: "GET",
    route: "meta/hugging_face_text_models",
  });
  return res;
}

export const get_pollination_text_models = async () => {
  // array [{name, pricing}, ..]
  const res = await apiRequest({
    method: "GET",
    route: "meta/pollination_text_models",
  });
  return res;
}