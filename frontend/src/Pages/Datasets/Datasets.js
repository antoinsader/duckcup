import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";

import {
  delete_user_dataset,
  get_dataset_content,
  get_dataset_entities,
} from "../../lib/backend/dataset";
import {
  get_dataset_clusters_all,
  get_dataset_clusters_per_sender,
  get_dataset_important_tokens,
  get_dataset_keywords,
} from "../../lib/backend/nlp";
import { get_email_columns } from "../../lib/config/common_columns";
import { useUserContext } from "../../lib/contexts/UserContext";

import ExtraSideBar from "../../components/layout_shell/ExtraSideBar";
import EmailContainerPopup from "../../components/page_components/EmailContainerPopup";
import RowDetailsPopup from "../../components/page_components/RowDetailsPopup";
import DataTable from "../../components/reusable/Datatable/Datatable";
import ConfirmPopup from "../../components/reusable/Popup/ConfirmPopup";

import ClustersAllSection from "./ClustersAllSection";
import ClustersPerSenderSection from "./ClustersPerSenderSection";
import ImportantTokensSection from "./ImportantTokensSection";
import SummarizeGroupsSection from "./SummarizeGroupsSection";
import {
  DATE_FILTER_PRESETS,
  is_date_in_filter_preset,
} from "../Telegram/entities_helpers";

import styles from "./Datasets.module.scss";
import { FaRemoveFormat } from "react-icons/fa";

const DEFAULT_CLUSTERING_BODY = {
  clustering_algorithm: "advanced",
  k_clusters: 4,
};

const SENDER_CHIPS_STEP = 5;

const dataset_operations = [
  {
    key: "important_tokens",
    label: "Dataset keywords",
    request_function: (dataset_id, operation_body = {}) => {
      const is_advanced_extractor = Boolean(
        operation_body?.use_advanced_extractor,
      );

      const grams_n_value = Number(operation_body?.grams_n);
      const grams_n =
        Number.isInteger(grams_n_value) && grams_n_value > 0
          ? grams_n_value
          : 100;

      if (is_advanced_extractor) {
        return get_dataset_keywords(dataset_id, {
          grams_n,
        });
      }

      return get_dataset_important_tokens(dataset_id, {
        maximum_gram: 3,
        grams_n,
      });
    },
  },
  {
    key: "clusters_per_sender",
    label: "Clusters per sender",
    request_function: (dataset_id, operation_body = {}) =>
      get_dataset_clusters_per_sender(dataset_id, {
        ...DEFAULT_CLUSTERING_BODY,
        ...(operation_body || {}),
      }),
  },
  {
    key: "clusters_all",
    label: "Clusters all",
    request_function: (dataset_id, operation_body = {}) =>
      get_dataset_clusters_all(dataset_id, {
        ...DEFAULT_CLUSTERING_BODY,
        ...(operation_body || {}),
      }),
  },
  {
    key: "summarize_groups",
    label: "Summarize messages groups",
  },
];

const build_operation_child_id = (dataset_id, operation_key) => {
  return `${String(dataset_id || "")}:${String(operation_key || "")}`;
};

const get_operation_key_from_child_id = (child_id) => {
  const child_id_value = String(child_id || "");
  const split_values = child_id_value.split(":");

  return split_values[1] || "";
};

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
      row_data?.sender_name,
  );
};

export default function Datasets() {
  const { datasets_data, datasets_loading, datasets_error, refreshDatasets } =
    useUserContext();

  const [selected_dataset_id, set_selected_dataset_id] = useState(null);
  const [dataset_content_data, set_dataset_content_data] = useState([]);
  const [dataset_content_loading, set_dataset_content_loading] =
    useState(false);
  const [selected_email_row, set_selected_email_row] = useState(null);
  const [is_email_popup_visible, set_is_email_popup_visible] = useState(false);
  const [selected_telegram_row, set_selected_telegram_row] = useState(null);
  const [is_telegram_popup_visible, set_is_telegram_popup_visible] =
    useState(false);
  const [show_delete_confirm, set_show_delete_confirm] = useState(false);
  const [is_deleting_dataset, set_is_deleting_dataset] = useState(false);
  const [active_child_id, set_active_child_id] = useState(null);
  const [enabled_operations_map, set_enabled_operations_map] = useState({});
  const [operation_loading_map, set_operation_loading_map] = useState({});
  const [operation_error_map, set_operation_error_map] = useState({});
  const [operation_data_map, set_operation_data_map] = useState({});
  const [pending_operation_scroll_key, set_pending_operation_scroll_key] =
    useState("");
  const [selected_sender_filters, set_selected_sender_filters] = useState([]);
  const [selected_date_filter, set_selected_date_filter] = useState("");
  const [specific_start_date, set_specific_start_date] = useState("");
  const [specific_end_date, set_specific_end_date] = useState("");
  const [visible_sender_chips_count, set_visible_sender_chips_count] =
    useState(SENDER_CHIPS_STEP);

  // Keyword filter state
  const [keyword_entities_data, set_keyword_entities_data] = useState({
    entities_descriptions: {},
    keywords: {},
  });
  const [keyword_entities_loading, set_keyword_entities_loading] =
    useState(false);
  const [keyword_entities_error, set_keyword_entities_error] = useState("");
  const [selected_keyword_filters, set_selected_keyword_filters] = useState([]); // [{entity_type, keyword}]
  // Fetch keyword entities when dataset changes
  useEffect(() => {
    let is_cancelled = false;
    if (!has_valid_value(selected_dataset_id)) {
      set_keyword_entities_data({ entities_descriptions: {}, keywords: {} });
      set_keyword_entities_loading(false);
      set_keyword_entities_error("");
      return;
    }
    set_keyword_entities_loading(true);
    set_keyword_entities_error("");
    get_dataset_entities(selected_dataset_id)
      .then((data) => {
        if (is_cancelled) return;
        set_keyword_entities_data({
          entities_descriptions: data?.entities_descriptions || {},
          keywords: data?.keywords || {},
        });
        set_keyword_entities_loading(false);
      })
      .catch((err) => {
        if (is_cancelled) return;
        set_keyword_entities_error("Failed to load keyword entities");
        set_keyword_entities_loading(false);
      });
    return () => {
      is_cancelled = true;
    };
  }, [selected_dataset_id]);
  // Clear keyword filters when dataset changes
  useEffect(() => {
    set_selected_keyword_filters([]);
  }, [selected_dataset_id]);
  const operation_section_refs = useRef({});
  const page_content_wrapper_ref = useRef(null);
  const selected_dataset_id_ref = useRef(selected_dataset_id);

  const memoDatasets = useMemo(() => datasets_data, [datasets_data]);
  const dataset_operations_by_key = useMemo(() => {
    return dataset_operations.reduce((acc, operation_row) => {
      acc[operation_row.key] = operation_row;
      return acc;
    }, {});
  }, []);
  const email_columns = useMemo(() => get_email_columns(), []);
  const operation_components_map = useMemo(() => {
    return {
      important_tokens: ImportantTokensSection,
      clusters_per_sender: ClustersPerSenderSection,
      clusters_all: ClustersAllSection,
      summarize_groups: SummarizeGroupsSection,
    };
  }, []);
  const telegram_columns = useMemo(() => {
    return [
      {
        field: "message_id",
        label: "Message id",
        hide: true,
      },
      {
        field: "entity_id",
        label: "Entity id",
        hide: true,
      },
      {
        field: "entity_name",
        label: "Entity name",
        search_visible: true,
      },
      {
        field: "message_date",
        label: "Message date",
        type: "datetime",
        search_visible: true,
      },
      {
        field: "sender_username",
        label: "Sender username",
        search_visible: true,
      },
      {
        field: "message_text",
        label: "Message text",
        search_visible: true,
        type: "part",
      },
      {
        field: "message_clean_text",
        label: "Message clean text",
        search_visible: true,
        type: "part",
        hide: true,
      },
    ];
  }, []);

  const is_section_outside_view = useCallback((section_node) => {
    if (!section_node) return false;

    const section_rect = section_node.getBoundingClientRect();
    const container_node = page_content_wrapper_ref.current;

    if (container_node) {
      const container_rect = container_node.getBoundingClientRect();
      return (
        section_rect.top < container_rect.top ||
        section_rect.bottom > container_rect.bottom
      );
    }

    return section_rect.top < 0 || section_rect.bottom > window.innerHeight;
  }, []);

  const extra_sidebar_items = useMemo(() => {
    return (memoDatasets || []).map((dataset_row) => ({
      id: dataset_row?.dataset_id,
      label: dataset_row?.ds_name || `Dataset ${dataset_row?.dataset_id || ""}`,
      subtitle: "",
      badges_values: [dataset_row?.count_emails].filter(
        (badge_value) => badge_value !== undefined && badge_value !== null,
      ),
      children: dataset_operations.map((operation_row) => {
        const operation_key = operation_row.key;
        const operation_loading =
          String(dataset_row?.dataset_id || "") ===
          String(selected_dataset_id || "")
            ? Boolean(operation_loading_map?.[operation_key])
            : false;

        return {
          id: build_operation_child_id(dataset_row?.dataset_id, operation_key),
          title: operation_row?.label,
          subtitle: operation_loading ? "Loading..." : "",
          badges_values: [],
        };
      }),
    }));
  }, [memoDatasets, operation_loading_map, selected_dataset_id]);

  const selected_dataset = useMemo(() => {
    return (memoDatasets || []).find(
      (dataset_row) =>
        String(dataset_row?.dataset_id || "") ===
        String(selected_dataset_id || ""),
    );
  }, [memoDatasets, selected_dataset_id]);

  const selected_dataset_name = useMemo(() => {
    return selected_dataset?.ds_name;
  }, [selected_dataset]);

  const selected_dataset_type = useMemo(() => {
    const dataset_type_value = String(selected_dataset?.dataset_type || "")
      .trim()
      .toLowerCase();

    return dataset_type_value || "EMAIL_GMAIL";
  }, [selected_dataset]);

  const selected_dataset_type_label = useMemo(() => {
    if (selected_dataset_type === "messaging_telegram") {
      return "Telegram messages";
    }

    return "Emails";
  }, [selected_dataset_type]);

  const is_telegram_dataset = selected_dataset_type === "messaging_telegram";

  const visible_operations = useMemo(() => {
    return dataset_operations.filter((operation_row) => {
      return Boolean(enabled_operations_map?.[operation_row.key]);
    });
  }, [enabled_operations_map]);

  const is_row_in_date_filter = useCallback(
    (row_data, date_filter_id) => {
      if (!date_filter_id) return true;

      const row_date_value = is_telegram_dataset
        ? row_data?.message_date || row_data?.date
        : row_data?.date;

      return is_date_in_filter_preset(row_date_value, date_filter_id);
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

  const sender_filtered_dataset_content_data = useMemo(() => {
    const selected_filters_map = selected_sender_filters.reduce(
      (acc, sender_key) => {
        acc[sender_key] = true;
        return acc;
      },
      {},
    );

    return (dataset_content_data || []).filter((row_data) => {
      const has_sender_filters = selected_sender_filters.length > 0;
      const sender_value = get_row_sender_value(
        row_data,
        Boolean(is_telegram_dataset),
      );

      if (!has_sender_filters) {
        return true;
      }

      return (
        has_valid_value(sender_value) &&
        Boolean(selected_filters_map[sender_value.toLowerCase()])
      );
    });
  }, [dataset_content_data, is_telegram_dataset, selected_sender_filters]);

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

    (sender_filtered_dataset_content_data || []).forEach((row_data) => {
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
  }, [is_row_in_date_filter, sender_filtered_dataset_content_data]);

  const date_mode_filtered_dataset_content_data = useMemo(() => {
    if (is_specific_date_range_active) {
      return (dataset_content_data || []).filter((row_data) => {
        return is_row_in_specific_date_range(
          row_data,
          specific_start_date,
          specific_end_date,
        );
      });
    }

    if (!selected_date_filter) {
      return dataset_content_data || [];
    }

    return (dataset_content_data || []).filter((row_data) => {
      return is_row_in_date_filter(row_data, selected_date_filter);
    });
  }, [
    dataset_content_data,
    is_row_in_date_filter,
    is_row_in_specific_date_range,
    is_specific_date_range_active,
    selected_date_filter,
    specific_end_date,
    specific_start_date,
  ]);

  const sender_filter_rows = useMemo(() => {
    const sender_count_map = {};

    (date_mode_filtered_dataset_content_data || []).forEach((row_data) => {
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

    console.log("[Datasets] sender filters computed", {
      dataset_id: selected_dataset?.dataset_id,
      dataset_rows_count: (dataset_content_data || []).length,
      active_date_filtered_rows_count: (
        date_mode_filtered_dataset_content_data || []
      ).length,
      selected_date_filter,
      specific_start_date,
      specific_end_date,
      unique_senders_count: sorted_sender_rows.length,
      top_senders_preview: sorted_sender_rows.slice(0, 10).map((row) => ({
        key: row.key,
        label: row.label,
        count: row.count,
      })),
    });

    return sorted_sender_rows;
  }, [
    dataset_content_data,
    date_mode_filtered_dataset_content_data,
    is_telegram_dataset,
    selected_date_filter,
    selected_dataset?.dataset_id,
    specific_end_date,
    specific_start_date,
  ]);

  const visible_sender_filter_rows = useMemo(() => {
    return sender_filter_rows.slice(0, visible_sender_chips_count);
  }, [sender_filter_rows, visible_sender_chips_count]);

  const has_more_sender_filter_rows = useMemo(() => {
    console.log("[Datasets] sender filters visibility", {
      visible_sender_chips_count,
      sender_filter_rows_count: sender_filter_rows.length,
      has_more: visible_sender_chips_count < sender_filter_rows.length,
    });

    return visible_sender_chips_count < sender_filter_rows.length;
  }, [sender_filter_rows.length, visible_sender_chips_count]);

  // Filtering logic: sender/date/keyword intersection
  const filtered_dataset_content_data = useMemo(() => {
    let base = sender_filtered_dataset_content_data || [];
    // Date filter
    if (is_specific_date_range_active) {
      base = base.filter((row_data) =>
        is_row_in_specific_date_range(
          row_data,
          specific_start_date,
          specific_end_date,
        ),
      );
    } else {
      base = base.filter((row_data) =>
        is_row_in_date_filter(row_data, selected_date_filter),
      );
    }

    // Keyword filter
    if (selected_keyword_filters.length > 0) {
      // Build a set of allowed ids (union of all selected keyword ids)
      const { keywords = {} } = keyword_entities_data || {};
      let allowed_ids_set = new Set();
      selected_keyword_filters.forEach(({ entity_type, keyword }) => {
        const ids =
          (keywords[entity_type] && keywords[entity_type][keyword]) || [];
        ids.forEach((id) => allowed_ids_set.add(String(id)));
      });
      // For emails: email_id, for telegram: message_id
      base = base.filter((row_data) => {
        const id = is_telegram_dataset
          ? String(row_data.message_id)
          : String(row_data.email_id);
        return allowed_ids_set.has(id);
      });
    }
    return base;
  }, [
    is_row_in_date_filter,
    is_row_in_specific_date_range,
    is_specific_date_range_active,
    selected_date_filter,
    sender_filtered_dataset_content_data,
    specific_end_date,
    specific_start_date,
    selected_keyword_filters,
    keyword_entities_data,
    is_telegram_dataset,
  ]);

  const active_date_filter_label = useMemo(() => {
    if (is_specific_date_range_active) {
      const start_label = has_valid_value(specific_start_date)
        ? specific_start_date
        : "Any";
      const end_label = has_valid_value(specific_end_date)
        ? specific_end_date
        : "Any";
      return `Specific range: ${start_label} -> ${end_label}`;
    }

    if (!selected_date_filter) {
      return "No date filter selected";
    }

    return (
      DATE_FILTER_PRESETS.find((row) => row.id === selected_date_filter)
        ?.label || "Date filter selected"
    );
  }, [
    is_specific_date_range_active,
    selected_date_filter,
    specific_end_date,
    specific_start_date,
  ]);

  const default_open_item_ids = useMemo(() => {
    if (!has_valid_value(selected_dataset_id)) return [];
    return [selected_dataset_id];
  }, [selected_dataset_id]);

  const handle_operation_click = useCallback(
    async (operation_key, dataset_id_value, operation_body = {}) => {
      const operation_row = dataset_operations_by_key?.[operation_key];
      if (!operation_row) return;

      const target_dataset_id =
        dataset_id_value ?? selected_dataset?.dataset_id;
      if (!has_valid_value(target_dataset_id)) return;

      const target_child_id = build_operation_child_id(
        target_dataset_id,
        operation_key,
      );
      set_active_child_id(target_child_id);
      set_enabled_operations_map((prev_state) => ({
        ...prev_state,
        [operation_key]: true,
      }));
      set_pending_operation_scroll_key(operation_key);

      console.log("[Datasets] operation clicked", {
        dataset_id: target_dataset_id,
        operation_key,
        operation_body,
      });

      if (!operation_row.request_function) {
        return;
      }

      set_operation_loading_map((prev_state) => ({
        ...prev_state,
        [operation_key]: true,
      }));
      set_operation_error_map((prev_state) => ({
        ...prev_state,
        [operation_key]: "",
      }));
      set_operation_data_map((prev_state) => ({
        ...prev_state,
        [operation_key]: [],
      }));

      const response = await operation_row.request_function(
        target_dataset_id,
        operation_body,
      );

      if (
        String(selected_dataset_id_ref.current || "") !==
        String(target_dataset_id || "")
      ) {
        console.log("[Datasets] stale operation response ignored", {
          dataset_id: target_dataset_id,
          operation_key,
        });
        set_operation_loading_map((prev_state) => ({
          ...prev_state,
          [operation_key]: false,
        }));
        return;
      }

      if (typeof response === "string") {
        set_operation_error_map((prev_state) => ({
          ...prev_state,
          [operation_key]: response || "Error loading operation",
        }));
        toast.error(response || "Error loading operation");
        set_operation_loading_map((prev_state) => ({
          ...prev_state,
          [operation_key]: false,
        }));
        return;
      }

      console.log("[Datasets] operation loaded", {
        dataset_id: target_dataset_id,
        operation_key,
        operation_body,
      });

      set_operation_data_map((prev_state) => ({
        ...prev_state,
        [operation_key]: response,
      }));
      set_enabled_operations_map((prev_state) => ({
        ...prev_state,
        [operation_key]: true,
      }));
      set_pending_operation_scroll_key(operation_key);
      set_operation_loading_map((prev_state) => ({
        ...prev_state,
        [operation_key]: false,
      }));
    },
    [dataset_operations_by_key, selected_dataset],
  );

  useEffect(() => {
    if (!has_valid_value(pending_operation_scroll_key)) return;

    if (!enabled_operations_map?.[pending_operation_scroll_key]) {
      return;
    }

    const section_node =
      operation_section_refs.current?.[pending_operation_scroll_key];
    if (!section_node) {
      set_pending_operation_scroll_key("");
      return;
    }

    window.requestAnimationFrame(() => {
      if (is_section_outside_view(section_node)) {
        section_node.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      set_pending_operation_scroll_key("");
    });
  }, [
    enabled_operations_map,
    is_section_outside_view,
    pending_operation_scroll_key,
  ]);

  useEffect(() => {
    if (!memoDatasets?.length) {
      set_selected_dataset_id(null);
      return;
    }

    const has_selected_dataset = memoDatasets.some(
      (dataset_row) =>
        String(dataset_row?.dataset_id || "") ===
        String(selected_dataset_id || ""),
    );

    if (!has_selected_dataset) {
      set_selected_dataset_id(memoDatasets[0]?.dataset_id || null);
    }
  }, [memoDatasets, selected_dataset_id]);

  useEffect(() => {
    selected_dataset_id_ref.current = selected_dataset_id;
  }, [selected_dataset_id]);

  const handle_dataset_click = useCallback((dataset_id) => {
    set_selected_dataset_id(has_valid_value(dataset_id) ? dataset_id : null);
    set_active_child_id(null);
  }, []);

  const handle_dataset_child_click = useCallback(
    (dataset_id, child_id) => {
      const target_dataset_id = has_valid_value(dataset_id) ? dataset_id : null;
      if (!has_valid_value(target_dataset_id)) return;

      const operation_key = get_operation_key_from_child_id(child_id);
      set_selected_dataset_id(target_dataset_id);

      if (!operation_key) return;
      handle_operation_click(operation_key, target_dataset_id);
    },
    [handle_operation_click],
  );

  const open_email_popup = useCallback((email_row) => {
    if (!email_row) return;

    set_selected_email_row(email_row);
    set_is_email_popup_visible(true);
  }, []);

  const close_email_popup = useCallback(() => {
    set_is_email_popup_visible(false);
    set_selected_email_row(null);
  }, []);

  const open_telegram_popup = useCallback((message_row) => {
    if (!message_row) return;

    set_selected_telegram_row(message_row);
    set_is_telegram_popup_visible(true);
  }, []);

  const close_telegram_popup = useCallback(() => {
    set_is_telegram_popup_visible(false);
    set_selected_telegram_row(null);
  }, []);

  const handle_dataset_row_click = useCallback(
    (row_data) => {
      if (is_telegram_dataset) {
        open_telegram_popup(row_data);
        return;
      }

      open_email_popup(row_data);
    },
    [is_telegram_dataset, open_email_popup, open_telegram_popup],
  );

  const handle_open_delete_confirm = useCallback(() => {
    if (!has_valid_value(selected_dataset?.dataset_id)) return;
    set_show_delete_confirm(true);
  }, [selected_dataset]);

  const handle_delete_dataset = useCallback(async () => {
    if (!has_valid_value(selected_dataset?.dataset_id) || is_deleting_dataset)
      return;

    set_is_deleting_dataset(true);

    console.log("[Datasets] deleting dataset", {
      dataset_id: selected_dataset.dataset_id,
    });

    try {
      const delete_res = await delete_user_dataset(selected_dataset.dataset_id);
      if (delete_res?.success) {
        toast.success("Dataset deleted successfully");
        set_show_delete_confirm(false);
        await refreshDatasets();
        return;
      }

      toast.error("Error deleting dataset");
    } finally {
      set_is_deleting_dataset(false);
    }
  }, [is_deleting_dataset, refreshDatasets, selected_dataset]);

  useEffect(() => {
    let is_cancelled = false;

    const fetch_dataset_content = async () => {
      if (!has_valid_value(selected_dataset_id)) {
        set_dataset_content_data([]);
        set_dataset_content_loading(false);
        return;
      }

      set_dataset_content_loading(true);
      console.log("[Datasets] loading dataset content", {
        dataset_id: selected_dataset_id,
      });

      const response = await get_dataset_content(selected_dataset_id);

      if (is_cancelled) return;

      const next_rows = Array.isArray(response) ? response : [];
      set_dataset_content_data(next_rows);
      set_dataset_content_loading(false);

      console.log("[Datasets] dataset content loaded", {
        dataset_id: selected_dataset_id,
        rows_count: next_rows.length,
      });
    };

    fetch_dataset_content();

    return () => {
      is_cancelled = true;
    };
  }, [selected_dataset_id]);

  useEffect(() => {
    set_is_email_popup_visible(false);
    set_selected_email_row(null);
    set_is_telegram_popup_visible(false);
    set_selected_telegram_row(null);
    set_active_child_id(null);
    set_enabled_operations_map({});
    set_operation_loading_map({});
    set_operation_error_map({});
    set_operation_data_map({});
    set_pending_operation_scroll_key("");
    set_selected_sender_filters([]);
    set_selected_date_filter("");
    set_specific_start_date("");
    set_specific_end_date("");
    set_visible_sender_chips_count(SENDER_CHIPS_STEP);
    operation_section_refs.current = {};
  }, [selected_dataset_id]);

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

      console.log("[Datasets] date filter selected", {
        date_filter_id: next_state,
        specific_start_date_cleared: true,
        specific_end_date_cleared: true,
      });

      return next_state;
    });
  }, []);

  const handle_specific_start_date_change = useCallback((event) => {
    const next_start_date = String(event?.target?.value || "");
    set_specific_start_date(next_start_date);
    set_selected_date_filter("");

    console.log("[Datasets] specific start date changed", {
      specific_start_date: next_start_date,
      preset_date_filter_cleared: true,
    });
  }, []);

  const handle_specific_end_date_change = useCallback((event) => {
    const next_end_date = String(event?.target?.value || "");
    set_specific_end_date(next_end_date);
    set_selected_date_filter("");

    console.log("[Datasets] specific end date changed", {
      specific_end_date: next_end_date,
      preset_date_filter_cleared: true,
    });
  }, []);

  const handle_show_more_sender_filters = useCallback(() => {
    set_visible_sender_chips_count((prev_state) => {
      const next_count = Math.min(
        prev_state + SENDER_CHIPS_STEP,
        sender_filter_rows.length,
      );

      console.log("[Datasets] show more sender filters", {
        previous_count: prev_state,
        next_count,
        total_count: sender_filter_rows.length,
      });

      return next_count;
    });
  }, [sender_filter_rows.length]);

  const section_header = useMemo(() => {
    const row_count_value = dataset_content_data?.length || 0;
    const rows_label =
      row_count_value === 1 ? "1 row" : `${row_count_value} rows`;

    return (
      <div className={styles.section_header_root}>
        {selected_dataset ? (
          <>
            <h1 className={styles.section_title}> {selected_dataset_name} </h1>
            <p className={styles.section_subtitle}>
              {`${selected_dataset_type_label} • ${rows_label}`}{" "}
            </p>
          </>
        ) : (
          <h1 className={styles.section_title}> No dataset selected</h1>
        )}
      </div>
    );
  }, [
    dataset_content_data,
    selected_dataset,
    selected_dataset_type_label,
    selected_dataset_name,
  ]);

  const filters_card_content = useMemo(() => {
    // Keyword filter UI
    const { entities_descriptions, keywords } = keyword_entities_data || {};
    const entity_types = Object.keys(keywords || {});

    return (
      <div className={styles.card_wrapper}>
        <div className={styles.card_title_container}>
          <h2 className={styles.card_title}> Dataset filters </h2>
          <p className={styles.subtitle}>
            You can apply filters on the dataset
          </p>
        </div>
        <div
          className={`${styles.card_content} ${styles.filters_card_content}`}
        >
          {/* Sender filter */}
          <div className={styles.sender_filters_card}>
            <div className={styles.sender_filters_header}>
              <span className={styles.card_title}>Filter by sender</span>
              <span className={styles.subtitle}>
                {selected_sender_filters.length > 0 ? (
                  <button
                    type="button"
                    className={`btn secondary ${styles.clear_filters_btn}`}
                    onClick={clear_sender_filters}
                  >
                    <FaRemoveFormat />
                  </button>
                ) : null}
                {selected_sender_filters.length
                  ? `${selected_sender_filters.length} selected`
                  : "No sender filter selected"}
              </span>
            </div>
            {sender_filter_rows.length ? (
              <div className={styles.sender_chips_row}>
                {visible_sender_filter_rows.map((sender_row) => {
                  const is_active = selected_sender_filters.includes(
                    sender_row.key,
                  );
                  return (
                    <button
                      key={`sender-filter-${sender_row.key}`}
                      type="button"
                      className={`${styles.sender_chip} ${is_active ? styles.sender_chip_active : ""}`}
                      onClick={() => handle_sender_filter_click(sender_row.key)}
                    >
                      <span>{sender_row.label}</span>
                      <span className={styles.sender_chip_count}>
                        {sender_row.count}
                      </span>
                    </button>
                  );
                })}
                {has_more_sender_filter_rows ? (
                  <button
                    type="button"
                    className={styles.sender_show_more_chip}
                    onClick={handle_show_more_sender_filters}
                  >
                    Show another{" "}
                    {Math.min(
                      SENDER_CHIPS_STEP,
                      sender_filter_rows.length -
                        visible_sender_filter_rows.length,
                    )}
                  </button>
                ) : null}
              </div>
            ) : (
              <span className={styles.dataset_label}>No senders found</span>
            )}
          </div>

          {/* Date range filter */}
          <div className={styles.sender_filters_card}>
            <div className={styles.sender_filters_header}>
              <span className={styles.card_title}>
                Filter with specific date range
              </span>
              <span className={styles.subtitle}>
                {is_specific_date_range_active
                  ? `Start: ${specific_start_date || "Any"} • End: ${specific_end_date || "Any"}`
                  : "No specific range selected"}
              </span>
            </div>
            <div className={styles.date_range_inputs_row}>
              <label className={styles.date_range_input_label}>
                Start date
                <input
                  type="date"
                  value={specific_start_date}
                  onChange={handle_specific_start_date_change}
                  className={styles.date_range_input}
                />
              </label>
              <label className={styles.date_range_input_label}>
                End date
                <input
                  type="date"
                  value={specific_end_date}
                  onChange={handle_specific_end_date_change}
                  className={styles.date_range_input}
                />
              </label>
            </div>
          </div>

          {/* Date preset filter */}
          <div className={styles.sender_filters_card}>
            <div className={styles.sender_filters_header}>
              <span className={styles.card_title}>Filter by date</span>
              <span className={styles.subtitle}>
                {active_date_filter_label}
              </span>
            </div>
            <div className={styles.date_chips_row}>
              {DATE_FILTER_PRESETS.map((date_filter_row) => {
                const is_active =
                  selected_date_filter === String(date_filter_row.id || "");
                const date_filter_count = Number(
                  date_filter_count_map?.[String(date_filter_row.id || "")] ||
                    0,
                );
                return (
                  <button
                    key={`date-filter-${date_filter_row.id}`}
                    type="button"
                    className={`${styles.date_chip} ${is_active ? styles.date_chip_active : ""}`}
                    onClick={() => handle_date_filter_click(date_filter_row.id)}
                  >
                    <span>{date_filter_row.label}</span>
                    <span className={styles.date_chip_count}>
                      {date_filter_count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Keyword filter */}
          <div className={styles.sender_filters_card}>
            <div className={styles.sender_filters_header}>
              <span className={styles.card_title}>Filter by keyword</span>
              <span className={styles.subtitle}>
                {selected_keyword_filters.length > 0 ? (
                  <button
                    type="button"
                    className={`btn secondary ${styles.clear_filters_btn}`}
                    onClick={() => set_selected_keyword_filters([])}
                  >
                    <FaRemoveFormat />
                  </button>
                ) : null}
                {selected_keyword_filters.length
                  ? `${selected_keyword_filters.length} selected`
                  : "No keyword filter selected"}
              </span>
            </div>
            {keyword_entities_loading ? (
              <span className={styles.dataset_label}>Loading keywords...</span>
            ) : keyword_entities_error ? (
              <span className={styles.dataset_label}>
                {keyword_entities_error}
              </span>
            ) : entity_types.length === 0 ? (
              <span className={styles.dataset_label}>No keywords found</span>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.7rem" }}>
                {entity_types.map((entity_type) => {
                  const entity_keywords = keywords[entity_type] || {};
                  const description = entities_descriptions[entity_type] || "";
                  return (
                    <div
                      key={entity_type}
                      style={{
                        minWidth: 180,
                        maxWidth: 260,
                        flex: "1 1 220px",
                        background: "var(--surface-2)",
                        borderRadius: 10,
                        padding: 8,
                        marginBottom: 8,
                        overflow: "auto",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>
                        {entity_type}
                      </div>
                      {description && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--text-sub)",
                            marginBottom: 6,
                          }}
                        >
                          {description}
                        </div>
                      )}
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 6,
                          maxHeight: 120,
                          overflowY: "auto",
                        }}
                      >
                        {Object.keys(entity_keywords).map((keyword) => {
                          const ids = entity_keywords[keyword] || [];
                          const is_active = selected_keyword_filters.some(
                            (f) =>
                              f.entity_type === entity_type &&
                              f.keyword === keyword,
                          );
                          return (
                            <button
                              key={entity_type + ":" + keyword}
                              type="button"
                              className={`${styles.sender_chip} ${is_active ? styles.sender_chip_active : ""}`}
                              style={{ marginBottom: 4 }}
                              onClick={() => {
                                set_selected_keyword_filters((prev) => {
                                  const exists = prev.some(
                                    (f) =>
                                      f.entity_type === entity_type &&
                                      f.keyword === keyword,
                                  );
                                  if (exists) {
                                    return prev.filter(
                                      (f) =>
                                        !(
                                          f.entity_type === entity_type &&
                                          f.keyword === keyword
                                        ),
                                    );
                                  } else {
                                    return [...prev, { entity_type, keyword }];
                                  }
                                });
                              }}
                            >
                              <span>{keyword}</span>
                              <span className={styles.sender_chip_count}>
                                {ids.length}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }, [
    selected_sender_filters,
    sender_filter_rows,
    visible_sender_filter_rows,
    handle_sender_filter_click,
    clear_sender_filters,
    has_more_sender_filter_rows,
    handle_show_more_sender_filters,
    active_date_filter_label,
    date_filter_count_map,
    selected_date_filter,
    is_specific_date_range_active,
    specific_start_date,
    specific_end_date,
    handle_date_filter_click,
    handle_specific_start_date_change,
    handle_specific_end_date_change,
    // keyword filter
    keyword_entities_data,
    keyword_entities_loading,
    keyword_entities_error,
    selected_keyword_filters,
    set_selected_keyword_filters,
  ]);

  const operations_card_content = useMemo(() => {
    if (!has_valid_value(selected_dataset?.dataset_id)) {
      return (
        <span className={styles.dataset_label}>
          Select a dataset from sidebar
        </span>
      );
    }

    return (
      <div className={`${styles.card_wrapper} accent_border`}>
        <div className={styles.card_title_container}>
          <h2 className={styles.card_title}>Dataset operations</h2>
          <span className={styles.subtitle}>
            {selected_dataset
              ? `Run NLP operations on ${selected_dataset?.ds_name || "selected dataset"}`
              : "Select a dataset to run operations"}
          </span>
        </div>
        <div className={styles.card_content}>
          {dataset_operations.map((operation_row) => {
            const operation_key = operation_row.key;
            const is_loading = Boolean(operation_loading_map?.[operation_key]);
            const is_enabled = Boolean(enabled_operations_map?.[operation_key]);
            const has_error = Boolean(operation_error_map?.[operation_key]);

            const operation_btn_class = [
              "btn thirdy",
              styles.operation_btn,
              is_enabled ? styles.operation_btn_active : "",
              is_loading ? styles.operation_btn_loading : "",
              has_error ? styles.operation_btn_danger : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button
                type="button"
                key={`operation-card-btn-${operation_key}`}
                className={operation_btn_class}
                onClick={() =>
                  handle_operation_click(
                    operation_key,
                    selected_dataset?.dataset_id,
                  )
                }
                disabled={is_loading}
              >
                <span>
                  {is_loading
                    ? `${operation_row.label}...`
                    : operation_row.label}
                </span>
                {is_loading ? <span className="spinner" /> : null}
              </button>
            );
          })}
        </div>
      </div>
    );
  }, [
    enabled_operations_map,
    handle_operation_click,
    operation_error_map,
    operation_loading_map,
    selected_dataset,
  ]);

  const section_content = useMemo(() => {
    if (!selected_dataset) {
      return (
        <span className={styles.dataset_label}>
          Select a dataset from sidebar
        </span>
      );
    }

    return (
      <div>
        {operations_card_content}
        {filters_card_content}
        <DataTable
          className={styles.datatable_root}
          columns={is_telegram_dataset ? telegram_columns : email_columns}
          data={filtered_dataset_content_data}
          loading={dataset_content_loading}
          title={is_telegram_dataset ? "Dataset messages" : "Dataset emails"}
          subtitle={`${filtered_dataset_content_data.length} shown / ${dataset_content_data.length} in dataset`}
          row_click={handle_dataset_row_click}
          server_pagination={false}
          hide_rows_per_page={true}
          customBtns={[
            {
              key: "delete-dataset",
              label: "Delete dataset",
              onClick: handle_open_delete_confirm,
              class: "btn danger",
            },
          ]}
        />
      </div>
    );
  }, [
    selected_dataset,
    operations_card_content,
    filters_card_content,
    handle_dataset_row_click,
    handle_open_delete_confirm,
    is_telegram_dataset,
    telegram_columns,
    email_columns,
    filtered_dataset_content_data,
    dataset_content_loading,
    dataset_content_data.length

  ]);

  if (datasets_loading) {
    return (
      <div className={styles.page_state}>
        <div className="spinner"></div>
        <span>Loading datasets...</span>
      </div>
    );
  }

  return (
    <div className={styles.datasets_root}>
      <ExtraSideBar
        title="Datasets Explorer"
        items={extra_sidebar_items}
        on_item_click={handle_dataset_click}
        on_child_click={handle_dataset_child_click}
        active_item_id_external={selected_dataset_id}
        active_child_id_external={active_child_id}
        default_open_item_ids={default_open_item_ids}
      />

      <div className={styles.content_root}>
        <div
          className={styles.pageContentWrapper}
          ref={page_content_wrapper_ref}
        >
          <div className={styles.main_content_block}>
            {section_header}
            {datasets_error && (
              <div className={styles.error}>{datasets_error}</div>
            )}

            <div className={styles.section_content_main}>{section_content}</div>
          </div>

          <div className={styles.operation_sections_root}>
            {visible_operations.map((operation_row) => {
              const operation_key = operation_row.key;
              const operation_label = operation_row.label;
              const operation_child_id = build_operation_child_id(
                selected_dataset?.dataset_id,
                operation_key,
              );
              const OperationSectionComponent =
                operation_components_map?.[operation_key];

              if (!OperationSectionComponent) return null;

              return (
                <div
                  key={`operation-section-${operation_key}`}
                  ref={(node) => {
                    if (!node) {
                      delete operation_section_refs.current[operation_key];
                      return;
                    }

                    operation_section_refs.current[operation_key] = node;
                  }}
                  className={`${styles.operation_section_item} ${
                    active_child_id === operation_child_id
                      ? styles.operation_section_item_active
                      : ""
                  }`}
                  onClick={() => set_active_child_id(operation_child_id)}
                >
                  <div className={styles.operation_section_header}>
                    <span className={styles.card_title}>{operation_label}</span>
                    <span className={styles.subtitle}>
                      {selected_dataset?.ds_name ||
                        "Selected dataset operation"}
                    </span>
                  </div>
                  <div className={styles.operation_section_content}>
                    <OperationSectionComponent
                      dataset_id={selected_dataset?.dataset_id}
                      is_loading={Boolean(
                        operation_loading_map?.[operation_key],
                      )}
                      error_text={operation_error_map?.[operation_key] || ""}
                      operation_data={operation_data_map?.[operation_key]}
                      is_telegram_dataset={is_telegram_dataset}
                      dataset_rows={dataset_content_data}
                      dataset_rows_loading={dataset_content_loading}
                      email_columns={email_columns}
                      telegram_columns={telegram_columns}
                      on_run_operation={(operation_body) =>
                        handle_operation_click(
                          operation_key,
                          selected_dataset?.dataset_id,
                          operation_body,
                        )
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <EmailContainerPopup
        is_visible={is_email_popup_visible && !is_telegram_dataset}
        close_popup={close_email_popup}
        dataset_id={selected_dataset?.dataset_id}
        email_row={selected_email_row}
      />

      <RowDetailsPopup
        is_visible={is_telegram_popup_visible && is_telegram_dataset}
        close_popup={close_telegram_popup}
        title={`Message Details - ${
          selected_telegram_row?.entity_name ||
          selected_telegram_row?.entity_id ||
          "Entity"
        }`}
        row_data={selected_telegram_row}
      />

      {show_delete_confirm && (
        <ConfirmPopup
          title="Delete dataset"
          message="Are you sure you want to delete the dataset ?"
          yes_label="Yes, delete"
          yes_function={handle_delete_dataset}
          yes_loading={is_deleting_dataset}
          close_function={() => set_show_delete_confirm(false)}
        />
      )}
    </div>
  );
}
