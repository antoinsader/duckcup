import { apiRequest } from "../api/api";

export const get_user_datasets = async () => {
  // Return [{dataset_type, dataset_id, ds_name, count_emails},...]
  const user_datasets = await apiRequest({
    route: "dataset/get_user_datasets",
  });
  return user_datasets;
};

export const insert_inbox_dataset = async ({
  criteria,
  account_id,
  dataset_name,
}) => {
  // returns new dataset {dataset_id, ds_name, count_emails}

  const new_dataset = await apiRequest({
    route: "dataset/save_inbox_dataset",
    body: {
      account_id: account_id,
      criteria: criteria,
      ds_name: dataset_name,
    },
  });
  return new_dataset;
};



export const save_telegram_dataset = async ({
  account_id,
  dataset_name,
  tuples,
}) => {
  const data = await apiRequest({
    route: "dataset/save_messages_dataset",
    body: {
      account_id,
      dataset_name,
      entity_message_tuples: tuples,
    },
  });

  return data;
};


export const get_dataset_entities = async (dataset_id) => {
  //  entities_descriptions: object - Keys are entity labels and values are descriptions of the entity labels.
  // keywords: object - keys are entity labels and value is dict with keys the entity text and values list of message ids where the entity was found. 

  const data= await apiRequest({
    route: "dataset/get_ds_keywords_entities",
    body: {
      dataset_id: dataset_id,
    },
  });
  return data;
}


export const get_dataset_content = async (dataset_id) => {
  // if dataset_id is type "emails" returns list[EmailFront] {email_id: str, subject: str, sender_signature: str, sender_email: str, date: str, content_clean : str, contains_attachement: bool, flags: list[str], language: str}
  // if dataset_id is type "telegram_messages" returns list[DatasetMessages] {    message_id: int, entity_id: str, entity_name: str , message_date: str, message_text: str, message_clean_text: str, sender_username: str} 
  const dataset_content = await apiRequest({
    route: "dataset/get_ds_content",
    body: {
      dataset_id: dataset_id,
    },
  });
  return dataset_content;
};

export const delete_user_dataset = async (dataset_id) => {
  // returns {success: bool}
  const del_res = await apiRequest({
    route: "dataset/delete_ds",
    body: { dataset_id },
  });
  return del_res;
};


export const get_dataste_email_html = async (dataset_id, email_id) => {
  // Return str
  const email_html = await apiRequest({
    route: "dataset/get_html_content",
    body: { dataset_id: dataset_id, email_id: email_id },
  });
  return email_html;
};
