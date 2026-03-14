import { apiBlobRequest, apiRequest } from "../api/api";

const get_file_name_from_content_disposition = (content_disposition_value) => {
  const normalized_value = String(content_disposition_value || "");
  if (!normalized_value) return "telegram_media";

  const file_name_match = normalized_value.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
  const encoded_file_name = file_name_match?.[1] || file_name_match?.[2] || "";
  if (!encoded_file_name) return "telegram_media";

  try {
    return decodeURIComponent(encoded_file_name);
  } catch (ex) {
    return encoded_file_name;
  }
};

export const get_telegram_entities =async (account_id) => {
  // Return entities array, each {chat_id, chat_name, chat_type, }
  const data = await apiRequest({
    route: "telegram/get_entities",
    body: {
      account_id: account_id, 
    }
  });
  return data;
}

export const get_telegram_chats =async (account_id, chat_id, limit = 100) => {
  // Return chat messages array, each {message_id, chat_id, date, sender_username,  text, views, forwards, media: bool  }
  const data = await apiRequest({
    route: "telegram/get_messages",
    body: {
      account_id: account_id, 
      chat_id: chat_id.toString(),
      limit: Number(limit) || 100,
    }
  });
  return data;
}

export const get_messages_multiple_chats = async (account_id, entities_with_limits) => {
  // entities with limits should be array of {chat_id, limit}
  // Return chat messages array, each {message_id, chat_id, date, sender_username,  text, views, forwards, media: bool  }
  const data = await apiRequest({
    route: "telegram/get_messages_multiple_chats",
    body: {
      account_id: account_id,
      entities: entities_with_limits
    }
  });
  return data;
  
}

export const analyze_messages =async (account_id, entities_with_limits) => {
  // entities with limits should be array of {chat_id, limit}

  /** Return object {analysis_entities, entities_descriptions}:
    analysis_entities object {ENTITY_TYPE: {ENTITY_TEXT: [LIST OF MESSAGES IDS]}} example:
      {PEOPLE: {TRUMP: [1,2,3], OBAMA: [5,6,7]}, CITIES:{MILAN: [5,2,1], ROME: [1,2,3]} }
    entities_descriptions: {ENTITY_TYPE: ENTITY DESCRIPTION}
   */

  

  const data = await apiRequest({
    route: "telegram/analyze_messages",
    body: {
      account_id: account_id, 
      entities: entities_with_limits


    }
  });
  return data;
}

export const get_telegram_message_media = async (account_id, chat_id, message_id) => {
  const response = await apiBlobRequest({
    route: "telegram/get_message_media",
    body: {
      account_id: account_id,
      chat_id: chat_id.toString(),
      message_id: message_id,
    },
    response_type: "blob",
    silence_error_handling: true,
  });

  if (!response || !response.data) return null;

  const mime_type = response?.data?.type || response?.headers?.["content-type"] || "application/octet-stream";
  const file_name = get_file_name_from_content_disposition(
    response?.headers?.["content-disposition"]
  );

  return {
    blob: response.data,
    mime_type,
    file_name,
  };
};