import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  get_rsa_public_key,
  get_saved_keys,
  save_encrypted_key,
} from "../../lib/backend/keys";
import {
  get_hf_text_models,
  get_pollination_text_models,
} from "../../lib/backend/meta";
import {
  get_group_messages_summarize_prompt,
  get_group_messages_summary,
} from "../../lib/backend/nlp";
import { api_tokens } from "../../lib/config/api_tokens";
import { encryptWithPublicKey } from "../../lib/encryption/encrypt";

import Button from "../../components/reusable/Button/Button";
import DataTable from "../../components/reusable/Datatable/Datatable";
import RichSelect from "../../components/reusable/Inputs/RichSelect";
import SetKeyPopup from "../../components/reusable/SetKeyPopup/SetKeyPopup";

import { DATE_FILTER_PRESETS } from "../Telegram/entities_helpers";

import { has_value } from "./clusters_shared";

import shared_styles from "./ClustersShared.module.scss";
import styles from "./SummarizeGroupsSection.module.scss";

const SENDER_CHIPS_STEP = 5;

const has_valid_value = (value) => {
  return value !== undefined && value !== null && String(value) !== "";
};

const normalize_sender_value = (value) => {
  if (!has_valid_value(value)) return "";
  return String(value).trim();
};

const build_start_of_day_timestamp = (date_value) => {
  if (!has_valid_value(date_value)) return null;

  const parsed_date = new Date(`${String(date_value)}T00:00:00`);
  const parsed_timestamp = parsed_date.getTime();
  if (Number.isNaN(parsed_timestamp)) return null;
  return parsed_timestamp;
};

const build_end_of_day_timestamp = (date_value) => {
  if (!has_valid_value(date_value)) return null;

  const parsed_date = new Date(`${String(date_value)}T23:59:59.999`);
  const parsed_timestamp = parsed_date.getTime();
  if (Number.isNaN(parsed_timestamp)) return null;
  return parsed_timestamp;
};

const get_row_sender_value = (row_data, is_telegram_dataset) => {
  if (!row_data || typeof row_data !== "object") return "";

  if (is_telegram_dataset) {
    return normalize_sender_value(
      row_data?.sender_username ||
        row_data?.entity_name ||
        row_data?.entity_id ||
        row_data?.sender ||
        row_data?.from,
    );
  }

  return normalize_sender_value(
    row_data?.sender ||
      row_data?.from ||
      row_data?.sender_email ||
      row_data?.sender_name ||
      row_data?.sender_signature,
  );
};

export default function SummarizeGroupsSection({
  dataset_id,
  dataset_rows,
  dataset_rows_loading,
  email_columns,
  telegram_columns,
  is_telegram_dataset,
}) {
  const [selected_date_filter, set_selected_date_filter] = useState("");
  const [specific_start_date, set_specific_start_date] = useState("");
  const [specific_end_date, set_specific_end_date] = useState("");
  const [selected_sender_filters, set_selected_sender_filters] = useState([]);
  const [visible_sender_chips_count, set_visible_sender_chips_count] =
    useState(SENDER_CHIPS_STEP);
  const [selected_doc_ids, set_selected_doc_ids] = useState([]);

  const [provider_options, set_provider_options] = useState([]);
  const [selected_provider, set_selected_provider] = useState("");
  const [model_options, set_model_options] = useState([]);
  const [selected_model, set_selected_model] = useState("");
  const [is_models_loading, set_is_models_loading] = useState(false);
  const [saved_keys_loading, set_saved_keys_loading] = useState(false);
  const [hf_key_available, set_hf_key_available] = useState(false);
  const [pollination_key_available, set_pollination_key_available] =
    useState(false);
  const [key_to_insert_obj, set_key_to_insert_obj] = useState(null);

  const [is_prompt_loading, set_is_prompt_loading] = useState(false);
  const [is_summary_loading, set_is_summary_loading] = useState(false);
  const [summarize_error_text, set_summarize_error_text] = useState("");
  const [summary_prompt, set_summary_prompt] = useState("");
  const [summary_answer, set_summary_answer] = useState("");
  const [
    summary_input_token_size_estimated,
    set_summary_input_token_size_estimated,
  ] = useState("");
  const [
    summary_output_token_size_estimated,
    set_summary_output_token_size_estimated,
  ] = useState("");

  const default_model_map = useMemo(() => {
    return {
      hugging_face: "Qwen/Qwen2.5-7B-Instruct",
      pollination: "polly",
    };
  }, []);

  const hf_token = useMemo(() => {
    return api_tokens.find((token_row) => token_row?.db_key === "hf_user");
  }, []);

  const pollination_token = useMemo(() => {
    return api_tokens.find(
      (token_row) => token_row?.db_key === "pollination_user",
    );
  }, []);

  const doc_id_field = useMemo(() => {
    return is_telegram_dataset ? "message_id" : "email_id";
  }, [is_telegram_dataset]);

  const table_columns = useMemo(() => {
    const base_columns = is_telegram_dataset ? telegram_columns : email_columns;

    return (base_columns || []).map((column_row) => {
      if (column_row?.field !== doc_id_field) {
        return column_row;
      }

      return {
        ...column_row,
        primary: true,
        search_visible: true,
      };
    });
  }, [doc_id_field, email_columns, is_telegram_dataset, telegram_columns]);

  const rows_data = useMemo(() => {
    return Array.isArray(dataset_rows) ? dataset_rows : [];
  }, [dataset_rows]);

  const is_row_in_date_filter = useCallback(
    (row_data, date_filter_id) => {
      if (!date_filter_id) return true;

      const row_date_value = is_telegram_dataset
        ? row_data?.message_date || row_data?.date
        : row_data?.date;

      const row_timestamp = new Date(row_date_value).getTime();
      if (Number.isNaN(row_timestamp)) return false;

      const now_date = new Date();
      const now_timestamp = now_date.getTime();
      const start_today = new Date(
        now_date.getFullYear(),
        now_date.getMonth(),
        now_date.getDate(),
      );
      const start_yesterday = new Date(start_today);
      start_yesterday.setDate(start_today.getDate() - 1);
      const start_last_week = new Date(now_date);
      start_last_week.setDate(now_date.getDate() - 7);
      const start_last_3_weeks = new Date(now_date);
      start_last_3_weeks.setDate(now_date.getDate() - 21);
      const start_last_month = new Date(now_date);
      start_last_month.setMonth(now_date.getMonth() - 1);
      const start_last_6_months = new Date(now_date);
      start_last_6_months.setMonth(now_date.getMonth() - 6);
      const start_last_year = new Date(now_date);
      start_last_year.setFullYear(now_date.getFullYear() - 1);

      switch (date_filter_id) {
        case "last_hour":
          return row_timestamp >= now_timestamp - 60 * 60 * 1000;
        case "last_3_hours":
          return row_timestamp >= now_timestamp - 3 * 60 * 60 * 1000;
        case "last_12_hours":
          return row_timestamp >= now_timestamp - 12 * 60 * 60 * 1000;
        case "today":
          return row_timestamp >= start_today.getTime();
        case "yesterday":
          return (
            row_timestamp >= start_yesterday.getTime() &&
            row_timestamp < start_today.getTime()
          );
        case "last_week":
          return (
            row_timestamp >= start_last_week.getTime() &&
            row_timestamp <= now_timestamp
          );
        case "last_3_weeks":
          return (
            row_timestamp >= start_last_3_weeks.getTime() &&
            row_timestamp <= now_timestamp
          );
        case "last_month":
          return (
            row_timestamp >= start_last_month.getTime() &&
            row_timestamp <= now_timestamp
          );
        case "last_6_months":
          return (
            row_timestamp >= start_last_6_months.getTime() &&
            row_timestamp <= now_timestamp
          );
        case "last_year":
          return (
            row_timestamp >= start_last_year.getTime() &&
            row_timestamp <= now_timestamp
          );
        default:
          return true;
      }
    },
    [is_telegram_dataset],
  );

  const is_row_in_specific_date_range = useCallback(
    (row_data, start_date_value, end_date_value) => {
      const row_date_value = is_telegram_dataset
        ? row_data?.message_date || row_data?.date
        : row_data?.date;
      const row_timestamp = new Date(row_date_value).getTime();
      if (Number.isNaN(row_timestamp)) return false;

      const start_timestamp = build_start_of_day_timestamp(start_date_value);
      const end_timestamp = build_end_of_day_timestamp(end_date_value);

      if (start_timestamp !== null && row_timestamp < start_timestamp) {
        return false;
      }

      if (end_timestamp !== null && row_timestamp > end_timestamp) {
        return false;
      }

      return true;
    },
    [is_telegram_dataset],
  );

  const is_specific_date_range_active = useMemo(() => {
    return (
      has_valid_value(specific_start_date) || has_valid_value(specific_end_date)
    );
  }, [specific_end_date, specific_start_date]);

  const date_mode_filtered_rows = useMemo(() => {
    if (is_specific_date_range_active) {
      return (rows_data || []).filter((row_data) => {
        return is_row_in_specific_date_range(
          row_data,
          specific_start_date,
          specific_end_date,
        );
      });
    }

    if (!selected_date_filter) {
      return rows_data || [];
    }

    return (rows_data || []).filter((row_data) => {
      return is_row_in_date_filter(row_data, selected_date_filter);
    });
  }, [
    is_row_in_date_filter,
    is_row_in_specific_date_range,
    is_specific_date_range_active,
    rows_data,
    selected_date_filter,
    specific_end_date,
    specific_start_date,
  ]);

  const sender_filter_rows = useMemo(() => {
    const sender_count_map = {};

    (date_mode_filtered_rows || []).forEach((row_data) => {
      const sender_value = get_row_sender_value(
        row_data,
        Boolean(is_telegram_dataset),
      );

      if (!has_valid_value(sender_value)) return;

      const sender_key = sender_value.toLowerCase();
      if (!sender_count_map[sender_key]) {
        sender_count_map[sender_key] = {
          key: sender_key,
          label: sender_value,
          count: 0,
        };
      }

      sender_count_map[sender_key].count += 1;
    });

    const sorted_sender_rows = Object.values(sender_count_map).sort(
      (left_row, right_row) => {
        return right_row.count - left_row.count;
      },
    );

    console.log("[SummarizeGroupsSection] sender filters computed", {
      dataset_id,
      dataset_rows_count: rows_data.length,
      active_date_filtered_rows_count: date_mode_filtered_rows.length,
      selected_date_filter,
      specific_start_date,
      specific_end_date,
      unique_senders_count: sorted_sender_rows.length,
    });

    return sorted_sender_rows;
  }, [
    dataset_id,
    date_mode_filtered_rows,
    is_telegram_dataset,
    rows_data.length,
    selected_date_filter,
    specific_end_date,
    specific_start_date,
  ]);

  const visible_sender_filter_rows = useMemo(() => {
    return sender_filter_rows.slice(0, visible_sender_chips_count);
  }, [sender_filter_rows, visible_sender_chips_count]);

  const has_more_sender_filter_rows = useMemo(() => {
    return visible_sender_chips_count < sender_filter_rows.length;
  }, [sender_filter_rows.length, visible_sender_chips_count]);

  const sender_filtered_rows = useMemo(() => {
    const selected_filters_map = selected_sender_filters.reduce(
      (acc, sender_key) => {
        acc[sender_key] = true;
        return acc;
      },
      {},
    );

    return (rows_data || []).filter((row_data) => {
      if (!selected_sender_filters.length) {
        return true;
      }

      const sender_value = get_row_sender_value(
        row_data,
        Boolean(is_telegram_dataset),
      );

      return (
        has_valid_value(sender_value) &&
        Boolean(selected_filters_map[sender_value.toLowerCase()])
      );
    });
  }, [is_telegram_dataset, rows_data, selected_sender_filters]);

  const filtered_rows = useMemo(() => {
    if (is_specific_date_range_active) {
      return (sender_filtered_rows || []).filter((row_data) => {
        return is_row_in_specific_date_range(
          row_data,
          specific_start_date,
          specific_end_date,
        );
      });
    }

    return (sender_filtered_rows || []).filter((row_data) => {
      return is_row_in_date_filter(row_data, selected_date_filter);
    });
  }, [
    is_row_in_date_filter,
    is_row_in_specific_date_range,
    is_specific_date_range_active,
    selected_date_filter,
    sender_filtered_rows,
    specific_end_date,
    specific_start_date,
  ]);

  const date_filter_count_map = useMemo(() => {
    const next_count_map = DATE_FILTER_PRESETS.reduce(
      (acc, date_filter_row) => {
        const date_filter_key = String(date_filter_row?.id || "");
        if (!has_valid_value(date_filter_key)) return acc;
        acc[date_filter_key] = 0;
        return acc;
      },
      {},
    );

    (sender_filtered_rows || []).forEach((row_data) => {
      DATE_FILTER_PRESETS.forEach((date_filter_row) => {
        const date_filter_key = String(date_filter_row?.id || "");
        if (!has_valid_value(date_filter_key)) return;

        if (is_row_in_date_filter(row_data, date_filter_key)) {
          next_count_map[date_filter_key] =
            Number(next_count_map[date_filter_key] || 0) + 1;
        }
      });
    });

    return next_count_map;
  }, [is_row_in_date_filter, sender_filtered_rows]);

  const filters_active = useMemo(() => {
    return (
      Boolean(selected_date_filter) ||
      is_specific_date_range_active ||
      selected_sender_filters.length > 0
    );
  }, [
    is_specific_date_range_active,
    selected_date_filter,
    selected_sender_filters.length,
  ]);

  useEffect(() => {
    set_visible_sender_chips_count((prev_state) => {
      if (sender_filter_rows.length <= SENDER_CHIPS_STEP) {
        return SENDER_CHIPS_STEP;
      }

      if (prev_state > sender_filter_rows.length) {
        return sender_filter_rows.length;
      }

      return prev_state;
    });
  }, [sender_filter_rows.length]);

  useEffect(() => {
    const available_sender_keys_map = sender_filter_rows.reduce((acc, row) => {
      acc[row.key] = true;
      return acc;
    }, {});

    set_selected_sender_filters((prev_state) => {
      const next_state = prev_state.filter((sender_key) => {
        return Boolean(available_sender_keys_map[sender_key]);
      });

      if (next_state.length === prev_state.length) {
        return prev_state;
      }

      return next_state;
    });
  }, [sender_filter_rows]);

  useEffect(() => {
    if (!filters_active) {
      set_selected_doc_ids([]);
      return;
    }

    const next_selected_ids = (filtered_rows || [])
      .map((row_data) => row_data?.[doc_id_field])
      .filter((row_id) => has_valid_value(row_id));

    set_selected_doc_ids(next_selected_ids);

    console.log("[SummarizeGroupsSection] auto-selected filtered rows", {
      dataset_id,
      selected_count: next_selected_ids.length,
      filters_active,
      selected_date_filter,
      specific_start_date,
      specific_end_date,
      selected_senders_count: selected_sender_filters.length,
    });
  }, [
    dataset_id,
    doc_id_field,
    filtered_rows,
    filters_active,
    selected_date_filter,
    selected_sender_filters.length,
    specific_end_date,
    specific_start_date,
  ]);

  useEffect(() => {
    set_summary_prompt("");
    set_summary_answer("");
    set_summary_input_token_size_estimated("");
    set_summary_output_token_size_estimated("");
    set_summarize_error_text("");
  }, [dataset_id, selected_doc_ids]);

  useEffect(() => {
    set_selected_date_filter("");
    set_specific_start_date("");
    set_specific_end_date("");
    set_selected_sender_filters([]);
    set_visible_sender_chips_count(SENDER_CHIPS_STEP);
    set_selected_doc_ids([]);
    set_summary_prompt("");
    set_summary_answer("");
    set_summary_input_token_size_estimated("");
    set_summary_output_token_size_estimated("");
    set_summarize_error_text("");
  }, [dataset_id]);

  const build_model_options = useCallback((provider_id, models_res) => {
    if (provider_id === "hugging_face") {
      return (Array.isArray(models_res) ? models_res : []).map((row_data) => {
        const model_id = row_data?.id || "";
        const downloads_number = Number(row_data?.downloads);
        const downloads_label = Number.isFinite(downloads_number)
          ? downloads_number.toLocaleString()
          : "0";

        return {
          id: model_id,
          label: model_id,
          description: `⬇ ${downloads_label}`,
          is_available: has_value(model_id),
        };
      });
    }

    return (Array.isArray(models_res) ? models_res : []).map((row_data) => {
      const model_id = row_data?.name || "";
      const pricing_label = has_value(row_data?.pricing)
        ? `Pricing: ${row_data.pricing}`
        : "";

      return {
        id: model_id,
        label: model_id,
        description: pricing_label,
        is_available: has_value(model_id),
      };
    });
  }, []);

  const load_models_for_provider = useCallback(
    async (provider_id, preferred_model = "") => {
      set_is_models_loading(true);
      set_summarize_error_text("");

      try {
        const models_res =
          provider_id === "hugging_face"
            ? await get_hf_text_models()
            : await get_pollination_text_models();

        const next_options = build_model_options(
          provider_id,
          models_res,
        ).filter((model_option) => has_value(model_option?.id));

        const default_model = default_model_map?.[provider_id] || "";
        const has_default_model = next_options.some(
          (model_option) => String(model_option?.id) === String(default_model),
        );
        const has_preferred_model = next_options.some(
          (model_option) =>
            String(model_option?.id) === String(preferred_model),
        );
        const fallback_model = next_options?.[0]?.id || "";
        const resolved_model = has_preferred_model
          ? preferred_model
          : has_default_model
            ? default_model
            : fallback_model;

        set_model_options(next_options);
        set_selected_model(resolved_model);

        return {
          selected_model: resolved_model,
          model_options: next_options,
        };
      } catch (error) {
        set_model_options([]);
        set_selected_model("");
        const load_models_error_text =
          "Unable to load models for selected provider.";
        set_summarize_error_text(load_models_error_text);

        console.log("[SummarizeGroupsSection] models loading failed", {
          dataset_id,
          provider_id,
          error,
        });

        return {
          selected_model: "",
          model_options: [],
        };
      } finally {
        set_is_models_loading(false);
      }
    },
    [build_model_options, dataset_id, default_model_map],
  );

  const sync_saved_keys = useCallback(async () => {
    set_saved_keys_loading(true);

    try {
      const saved_keys_res = await get_saved_keys();
      const hf_available =
        saved_keys_res?.hf_user !== null &&
        saved_keys_res?.hf_user !== undefined;
      const pollination_available =
        saved_keys_res?.pollination_user !== null &&
        saved_keys_res?.pollination_user !== undefined;

      set_hf_key_available(Boolean(hf_available));
      set_pollination_key_available(Boolean(pollination_available));

      const next_provider_options = [
        {
          id: "pollination",
          label: "Pollination",
          description: "Use your Pollination key",
          is_available: Boolean(pollination_available),
        },
        {
          id: "hugging_face",
          label: "Hugging Face",
          description: "Use your Hugging Face key",
          is_available: Boolean(hf_available),
        },
      ];

      const first_available_provider = next_provider_options.find(
        (provider_row) => provider_row?.is_available,
      );

      const available_provider_ids = next_provider_options
        .filter((provider_row) => provider_row?.is_available)
        .map((provider_row) => provider_row?.id);
      const can_keep_selected_provider =
        available_provider_ids.includes(selected_provider);
      const resolved_provider = can_keep_selected_provider
        ? selected_provider
        : first_available_provider?.id || "";

      set_provider_options(next_provider_options);
      set_selected_provider(resolved_provider);

      if (resolved_provider) {
        const load_res = await load_models_for_provider(
          resolved_provider,
          resolved_provider === selected_provider ? selected_model : "",
        );

        return {
          has_available_provider: true,
          provider_id: resolved_provider,
          model_id: load_res?.selected_model || "",
        };
      }

      set_model_options([]);
      set_selected_model("");
      set_summarize_error_text(
        "You should set a valid key for Hugging Face or Pollination.",
      );

      return {
        has_available_provider: false,
        provider_id: "",
        model_id: "",
      };
    } catch (error) {
      set_provider_options([
        {
          id: "hugging_face",
          label: "Hugging Face",
          description: "Use your Hugging Face key",
          is_available: false,
        },
        {
          id: "pollination",
          label: "Pollination",
          description: "Use your Pollination key",
          is_available: false,
        },
      ]);
      set_summarize_error_text("Unable to check provider keys right now.");

      console.log("[SummarizeGroupsSection] saved keys loading failed", {
        dataset_id,
        error,
      });

      return {
        has_available_provider: false,
        provider_id: "",
        model_id: "",
      };
    } finally {
      set_saved_keys_loading(false);
    }
  }, [dataset_id, load_models_for_provider, selected_model, selected_provider]);

  useEffect(() => {
    sync_saved_keys();
  }, [sync_saved_keys]);

  const show_save_key_popup = useCallback((set_route, key_title) => {
    set_key_to_insert_obj({ route: set_route, key_title });
  }, []);

  const on_confirm_save = useCallback(
    async (set_route, key_val) => {
      try {
        const public_key = await get_rsa_public_key();
        const encrypted = await encryptWithPublicKey(key_val, public_key);
        const saving_res = await save_encrypted_key(set_route, encrypted);

        if (saving_res && saving_res.success) {
          toast.success("Your key is saved");
          await sync_saved_keys();
          return;
        }

        if (saving_res && !saving_res.success) {
          toast.error("Your key is invalid !");
          throw new Error("Your key is invalid");
        }

        throw new Error("There was an error trying to save the key");
      } catch (error) {
        console.error(
          "[SummarizeGroupsSection] error trying to save key",
          error,
        );
        throw new Error(
          error?.message || "There was an error trying to save the key",
        );
      }
    },
    [sync_saved_keys],
  );

  const handle_provider_change = useCallback(
    async (provider_id) => {
      set_selected_provider(provider_id);
      set_summary_answer("");
      await load_models_for_provider(provider_id);
    },
    [load_models_for_provider],
  );

  const handle_model_change = useCallback((model_id) => {
    set_selected_model(model_id);
    set_summary_answer("");
  }, []);

  const handle_sender_filter_click = useCallback((sender_key) => {
    if (!has_valid_value(sender_key)) return;

    set_selected_sender_filters((prev_state) => {
      if (prev_state.includes(sender_key)) {
        return prev_state.filter((row_key) => row_key !== sender_key);
      }

      return [...prev_state, sender_key];
    });
  }, []);

  const clear_sender_filters = useCallback(() => {
    set_selected_sender_filters([]);
  }, []);

  const handle_date_filter_click = useCallback((date_filter_id) => {
    if (!date_filter_id) return;

    set_specific_start_date("");
    set_specific_end_date("");

    set_selected_date_filter((prev_state) => {
      const next_state = prev_state === date_filter_id ? "" : date_filter_id;

      console.log("[SummarizeGroupsSection] date filter selected", {
        date_filter_id: next_state,
      });

      return next_state;
    });
  }, []);

  const handle_specific_start_date_change = useCallback((event) => {
    const next_start_date = String(event?.target?.value || "");
    set_specific_start_date(next_start_date);
    set_selected_date_filter("");
  }, []);

  const handle_specific_end_date_change = useCallback((event) => {
    const next_end_date = String(event?.target?.value || "");
    set_specific_end_date(next_end_date);
    set_selected_date_filter("");
  }, []);

  const handle_show_more_sender_filters = useCallback(() => {
    set_visible_sender_chips_count((prev_state) => {
      return Math.min(
        prev_state + SENDER_CHIPS_STEP,
        sender_filter_rows.length,
      );
    });
  }, [sender_filter_rows.length]);

  const selected_ids_set = useMemo(() => {
    return selected_doc_ids.reduce((acc, row_id) => {
      acc[row_id] = true;
      return acc;
    }, {});
  }, [selected_doc_ids]);

  const selected_rows_count = selected_doc_ids.length;

  const selected_rows = useMemo(() => {
    return (rows_data || []).filter((row_data) => {
      return Boolean(selected_ids_set[row_data?.[doc_id_field]]);
    });
  }, [doc_id_field, rows_data, selected_ids_set]);

  const handle_generate_prompt = useCallback(async () => {
    if (!has_value(selected_provider)) {
      set_summarize_error_text(
        "You should set a valid key for Hugging Face or Pollination to use summarize.",
      );
      return;
    }

    if (!has_value(selected_model)) {
      set_summarize_error_text("Please choose a model.");
      return;
    }

    if (!has_value(dataset_id)) {
      set_summarize_error_text("Missing dataset id.");
      return;
    }

    if (!selected_rows_count) {
      set_summarize_error_text("Please select at least one message.");
      return;
    }

    set_is_prompt_loading(true);
    set_summarize_error_text("");
    set_summary_prompt("");
    set_summary_answer("");

    try {
      console.log("[SummarizeGroupsSection] generating summarize prompt", {
        dataset_id,
        selected_messages_count: selected_rows_count,
        provider_id: selected_provider,
        model_id: selected_model,
      });

      const summarize_prompt_res = await get_group_messages_summarize_prompt(
        dataset_id,
        selected_doc_ids,
      );

      if (typeof summarize_prompt_res === "string") {
        throw new Error(
          summarize_prompt_res ||
            "Unable to generate summarize prompt for selected messages.",
        );
      }

      set_summary_prompt(String(summarize_prompt_res?.prompt || ""));
      set_summary_input_token_size_estimated(
        String(summarize_prompt_res?.input_token_size_estimated ?? ""),
      );
      set_summary_output_token_size_estimated(
        String(summarize_prompt_res?.output_token_size_estimated ?? ""),
      );
    } catch (error) {
      set_summarize_error_text(
        String(
          error?.message ||
            "Unable to generate summarize prompt for selected messages.",
        ),
      );
    } finally {
      set_is_prompt_loading(false);
    }
  }, [
    dataset_id,
    selected_doc_ids,
    selected_model,
    selected_provider,
    selected_rows_count,
  ]);

  const handle_send_prompt = useCallback(async () => {
    if (!has_value(selected_provider)) {
      set_summarize_error_text(
        "You should set a valid key for Hugging Face or Pollination to use summarize.",
      );
      return;
    }

    if (!has_value(selected_model)) {
      set_summarize_error_text("Please choose a model.");
      return;
    }

    if (!has_value(dataset_id)) {
      set_summarize_error_text("Missing dataset id.");
      return;
    }

    if (!selected_rows_count) {
      set_summarize_error_text("Please select at least one message.");
      return;
    }

    if (!has_value(summary_prompt)) {
      set_summarize_error_text(
        "No summarize prompt found. Please click summarize first.",
      );
      return;
    }

    set_is_summary_loading(true);
    set_summarize_error_text("");
    set_summary_answer("");

    try {
      console.log("[SummarizeGroupsSection] sending summarize prompt", {
        dataset_id,
        selected_messages_count: selected_rows_count,
        provider_id: selected_provider,
        model_id: selected_model,
      });

      const summarize_res = await get_group_messages_summary(
        dataset_id,
        selected_doc_ids,
        selected_model,
        selected_provider,
      );

      if (typeof summarize_res === "string") {
        throw new Error(
          summarize_res || "Unable to summarize selected messages right now.",
        );
      }

      const next_summary_answer = String(summarize_res?.answer || "").trim();
      if (!has_value(next_summary_answer)) {
        throw new Error("Unable to summarize selected messages right now.");
      }

      set_summary_answer(next_summary_answer);
    } catch (error) {
      set_summarize_error_text(
        String(error?.message || "Unable to summarize selected messages."),
      );
    } finally {
      set_is_summary_loading(false);
    }
  }, [
    dataset_id,
    selected_doc_ids,
    selected_model,
    selected_provider,
    selected_rows_count,
    summary_prompt,
  ]);

  return (
    <div className={styles.section_root}>
      <div className={shared_styles.ai_popup_card}>
        <h4 className={shared_styles.ai_popup_card_title}>
          Summarize messages groups
        </h4>
        <p className={shared_styles.ai_popup_card_description}>
          Select providers and model, then filter and check messages to define
          the group that will be summarized.
        </p>

        <div className={shared_styles.refine_selects_row}>
          <RichSelect
            label="Provider"
            value={selected_provider}
            options={provider_options}
            onChange={handle_provider_change}
            compact={true}
          />

          <RichSelect
            label="Model"
            value={selected_model}
            options={model_options}
            onChange={handle_model_change}
            disabled={!has_value(selected_provider) || is_models_loading}
            compact={true}
          />
        </div>

        {is_models_loading && (
          <p className={shared_styles.info_text}>Loading models...</p>
        )}

        {!hf_key_available && !pollination_key_available && (
          <div className={shared_styles.ai_popup_card_actions}>
            {!pollination_key_available && (
              <Button
                size="small"
                variant="secondary"
                onClick={() =>
                  show_save_key_popup(
                    pollination_token?.set_route,
                    pollination_token?.name || "Pollination",
                  )
                }
                disabled={saved_keys_loading || !pollination_token?.set_route}
              >
                Set pollination key
              </Button>
            )}

            {!hf_key_available && (
              <Button
                size="small"
                variant="secondary"
                onClick={() =>
                  show_save_key_popup(
                    hf_token?.set_route,
                    hf_token?.name || "Hugging face",
                  )
                }
                disabled={saved_keys_loading || !hf_token?.set_route}
              >
                Set hugging face key
              </Button>
            )}
          </div>
        )}

        <div className={styles.filters_grid}>
          <div className={styles.filter_card}>
            <div className={styles.filter_header}>
              <span className={styles.filter_title}>Filter by sender</span>
              <span className={styles.filter_subtitle}>
                {selected_sender_filters.length
                  ? `${selected_sender_filters.length} selected`
                  : "No sender filter selected"}
              </span>
            </div>

            {selected_sender_filters.length > 0 && (
              <div className={styles.filter_actions_row}>
                <button
                  type="button"
                  className={`btn secondary ${styles.clear_btn}`}
                  onClick={clear_sender_filters}
                >
                  Clear sender filters
                </button>
              </div>
            )}

            {sender_filter_rows.length > 0 ? (
              <div className={styles.chips_row}>
                {visible_sender_filter_rows.map((sender_row) => {
                  const is_active = selected_sender_filters.includes(
                    sender_row.key,
                  );

                  return (
                    <button
                      key={`summary-sender-filter-${sender_row.key}`}
                      type="button"
                      className={`${styles.chip_btn} ${
                        is_active ? styles.chip_btn_active : ""
                      }`}
                      onClick={() => handle_sender_filter_click(sender_row.key)}
                    >
                      <span>{sender_row.label}</span>
                      <span className={styles.chip_count}>
                        {sender_row.count}
                      </span>
                    </button>
                  );
                })}

                {has_more_sender_filter_rows && (
                  <button
                    type="button"
                    className={styles.show_more_chip}
                    onClick={handle_show_more_sender_filters}
                  >
                    Show another{" "}
                    {Math.min(
                      SENDER_CHIPS_STEP,
                      sender_filter_rows.length -
                        visible_sender_filter_rows.length,
                    )}
                  </button>
                )}
              </div>
            ) : (
              <p className={shared_styles.info_text}>No senders found.</p>
            )}
          </div>
          <div className={styles.filter_card}>
            <div className={styles.filter_header}>
              <span className={styles.filter_title}>Filter by date</span>
              <span className={styles.filter_subtitle}>
                {selected_date_filter
                  ? DATE_FILTER_PRESETS.find(
                      (row) => row.id === selected_date_filter,
                    )?.label || "Date filter selected"
                  : "No date filter selected"}
              </span>
            </div>
            <div className={styles.chips_row}>
              {DATE_FILTER_PRESETS.map((date_filter_row) => {
                const is_active =
                  selected_date_filter === String(date_filter_row.id || "");
                const date_filter_count = Number(
                  date_filter_count_map?.[String(date_filter_row.id || "")] ||
                    0,
                );

                return (
                  <button
                    key={`summary-date-filter-${date_filter_row.id}`}
                    type="button"
                    className={`${styles.chip_btn} ${
                      is_active ? styles.chip_btn_active : ""
                    }`}
                    onClick={() => handle_date_filter_click(date_filter_row.id)}
                  >
                    <span>{date_filter_row.label}</span>
                    <span className={styles.chip_count}>
                      {date_filter_count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.filter_card}>
            <div className={styles.filter_header}>
              <span className={styles.filter_title}>
                Filter with specific date range
              </span>
              <span className={styles.filter_subtitle}>
                {is_specific_date_range_active
                  ? `Start: ${specific_start_date || "Any"} • End: ${
                      specific_end_date || "Any"
                    }`
                  : "No specific range selected"}
              </span>
            </div>

            <div className={styles.date_inputs_row}>
              <label className={styles.date_input_label}>
                Start date
                <input
                  type="date"
                  value={specific_start_date}
                  onChange={handle_specific_start_date_change}
                  className={styles.date_input}
                />
              </label>

              <label className={styles.date_input_label}>
                End date
                <input
                  type="date"
                  value={specific_end_date}
                  onChange={handle_specific_end_date_change}
                  className={styles.date_input}
                />
              </label>
            </div>
          </div>
        </div>

        <div className={styles.selection_card}>
          <p className={styles.selection_title}>Summary group selection</p>
          <p className={styles.selection_subtitle}>
            {filters_active
              ? "Filtered messages are auto-selected. You can uncheck rows to remove them from the summary group."
              : "By default all rows are unchecked. Apply at least one filter to auto-select a summarize group."}
          </p>
          <div className={styles.selection_stats_row}>
            <span>{selected_rows_count} selected</span>
            <span>{filtered_rows.length} shown after filters</span>
            <span>{rows_data.length} total in dataset</span>
          </div>

          <div className={shared_styles.ai_popup_card_actions}>
            <Button
              size="small"
              variant="secondary"
              onClick={handle_generate_prompt}
              disabled={
                is_prompt_loading || is_summary_loading || !selected_rows_count
              }
            >
              {is_prompt_loading
                ? "Generating prompt..."
                : `Summarize (${selected_rows_count} selected)`}
            </Button>
          </div>
        </div>

        {has_value(summarize_error_text) && (
          <p className={shared_styles.validation_text}>
            {summarize_error_text}
          </p>
        )}

        {has_value(summary_prompt) && (
          <div className={shared_styles.refine_card}>
            <h4 className={shared_styles.refine_card_title}>Default prompt</h4>
            <p className={shared_styles.ai_popup_card_description}>
              input tokens: {summary_input_token_size_estimated || "-"} | output
              tokens: {summary_output_token_size_estimated || "-"}
            </p>
            <textarea
              className={shared_styles.prompt_textarea}
              value={summary_prompt}
              readOnly
              disabled
            />
            <div className={shared_styles.warning_box}>
              <p className={shared_styles.warning_text}>
                Send this prompt to generate the final summary answer?
              </p>
              <div className={shared_styles.ai_popup_card_actions}>
                <Button
                  onClick={handle_send_prompt}
                  size="small"
                  variant="secondary"
                  disabled={is_summary_loading}
                >
                  {is_summary_loading ? "Summarizing..." : "Send prompt"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {has_value(summary_answer) && (
          <div className={styles.summary_answer_card_active}>
            <h4 className={shared_styles.refine_card_title}>Summary answer</h4>
            <p className={shared_styles.summary_answer_text}>
              {summary_answer}
            </p>
          </div>
        )}
      </div>

      <DataTable
        className={styles.datatable_root}
        columns={table_columns}
        data={filtered_rows}
        loading={Boolean(dataset_rows_loading)}
        title={
          is_telegram_dataset ? "Messages to summarize" : "Emails to summarize"
        }
        subtitle={`${selected_rows.length} selected • ${filtered_rows.length} shown / ${rows_data.length} total`}
        allow_select_rows={true}
        selected_primary_values={selected_doc_ids}
        on_selected_primary_values_change={set_selected_doc_ids}
        server_pagination={false}
        hide_rows_per_page={true}
      />

      <SetKeyPopup
        key_to_insert_obj={key_to_insert_obj}
        set_key_to_insert_obj={set_key_to_insert_obj}
        on_confirm_save={on_confirm_save}
      />
    </div>
  );
}
