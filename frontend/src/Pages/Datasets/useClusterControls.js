import { useEffect, useMemo, useState } from "react";

import { get_embedders_types } from "../../lib/backend/meta";

import {
  DEFAULT_ALGORITHM_TYPE,
  DEFAULT_K_CLUSTERS,
  has_value,
  is_valid_positive_int,
} from "./clusters_shared";

export default function useClusterControls({ on_run_operation, log_prefix }) {
  const [algorithm_type, set_algorithm_type] = useState(DEFAULT_ALGORITHM_TYPE);
  const [applied_algorithm_type, set_applied_algorithm_type] = useState(
    DEFAULT_ALGORITHM_TYPE,
  );
  const [k_clusters_value, set_k_clusters_value] = useState(DEFAULT_K_CLUSTERS);
  const [applied_k_clusters_value, set_applied_k_clusters_value] =
    useState(DEFAULT_K_CLUSTERS);
  const [embedder_options, set_embedder_options] = useState([]);
  const [embedder_type, set_embedder_type] = useState("");
  const [applied_embedder_type, set_applied_embedder_type] = useState("");
  const [model_value, set_model_value] = useState("");
  const [applied_model_value, set_applied_model_value] = useState("");
  const [show_advanced_options, set_show_advanced_options] = useState(false);
  const [is_embedders_loading, set_is_embedders_loading] = useState(false);
  const [embedder_error_text, set_embedder_error_text] = useState("");
  const [validation_error, set_validation_error] = useState("");

  const is_advanced_selected = algorithm_type === "advanced";
  const is_semantics_selected = algorithm_type === "sematics_kmeans";
  const can_select_embedder_model =
    is_semantics_selected || is_advanced_selected;

  const has_pending_changes =
    algorithm_type !== applied_algorithm_type ||
    (!is_advanced_selected &&
      String(k_clusters_value) !== String(applied_k_clusters_value)) ||
    (can_select_embedder_model &&
      show_advanced_options &&
      has_value(embedder_type) &&
      String(embedder_type) !== String(applied_embedder_type)) ||
    (can_select_embedder_model &&
      show_advanced_options &&
      String(model_value || "") !== String(applied_model_value || ""));

  const selected_embedder_row = useMemo(() => {
    return embedder_options.find(
      (option_row) => String(option_row?.id) === String(embedder_type),
    );
  }, [embedder_options, embedder_type]);

  useEffect(() => {
    let is_cancelled = false;

    const fetch_embedders = async () => {
      set_is_embedders_loading(true);
      set_embedder_error_text("");

      const response = await get_embedders_types();

      if (is_cancelled) return;

      if (typeof response === "string") {
        set_embedder_options([]);
        set_embedder_error_text(response || "Error loading embedders");
        set_is_embedders_loading(false);
        return;
      }

      const embedders_list = Array.isArray(response) ? response : [];
      const default_embedder_row =
        embedders_list.find((row) => row?.is_default) || embedders_list[0];

      set_embedder_options(embedders_list);
      set_embedder_type(default_embedder_row?.id || "");
      set_applied_embedder_type(default_embedder_row?.id || "");
      set_model_value(default_embedder_row?.default_model || "");
      set_applied_model_value(default_embedder_row?.default_model || "");
      set_is_embedders_loading(false);
    };

    fetch_embedders();

    return () => {
      is_cancelled = true;
    };
  }, []);

  const clear_validation_error = () => {
    if (validation_error) {
      set_validation_error("");
    }
  };

  const handle_algorithm_change = (event) => {
    const next_algorithm_type = event.target.value;
    set_algorithm_type(next_algorithm_type);
    set_show_advanced_options(false);
    clear_validation_error();
  };

  const handle_k_clusters_change = (event) => {
    const next_k_clusters_value = event.target.value;
    set_k_clusters_value(next_k_clusters_value);
    clear_validation_error();
  };

  const handle_embedder_change = (next_embedder_type) => {
    set_embedder_type(next_embedder_type);

    const selected_embedder = embedder_options.find(
      (option_row) =>
        String(option_row?.id || "") === String(next_embedder_type || ""),
    );
    set_model_value(selected_embedder?.default_model || "");
    clear_validation_error();
  };

  const handle_model_change = (event) => {
    set_model_value(event.target.value);
    clear_validation_error();
  };

  const toggle_advanced_options = () => {
    set_show_advanced_options((prev_state) => !prev_state);
  };

  const handle_refresh = () => {
    if (!is_advanced_selected && !is_valid_positive_int(k_clusters_value)) {
      set_validation_error("k_clusters must be a positive integer.");
      return;
    }

    set_validation_error("");

    const payload = {
      clustering_algorithm: algorithm_type,
    };

    if (
      can_select_embedder_model &&
      show_advanced_options &&
      has_value(embedder_type)
    ) {
      payload.embedder_type = embedder_type;
    }
    if (
      can_select_embedder_model &&
      show_advanced_options &&
      has_value(model_value)
    ) {
      payload.model = String(model_value).trim();
    }

    if (!is_advanced_selected) {
      payload.k_clusters = Number(k_clusters_value);
    }

    set_applied_algorithm_type(algorithm_type);
    if (!is_advanced_selected) {
      set_applied_k_clusters_value(String(k_clusters_value));
    }
    set_applied_embedder_type(String(embedder_type || ""));
    set_applied_model_value(String(model_value || ""));

    console.log(`[${log_prefix}] refresh clicked`, payload);
    on_run_operation?.(payload);
  };

  return {
    algorithm_type,
    can_select_embedder_model,
    embedder_error_text,
    embedder_options,
    embedder_type,
    handle_algorithm_change,
    handle_embedder_change,
    handle_k_clusters_change,
    handle_model_change,
    handle_refresh,
    has_pending_changes,
    is_advanced_selected,
    is_embedders_loading,
    k_clusters_value,
    model_value,
    selected_embedder_row,
    show_advanced_options,
    toggle_advanced_options,
    validation_error,
  };
}