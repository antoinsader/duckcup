import React from "react";

import Button from "../../components/reusable/Button/Button";
import RichSelect from "../../components/reusable/Inputs/RichSelect";

import { ALGORITHM_OPTIONS, has_value } from "./clusters_shared";

import styles from "./ClustersShared.module.scss";

export default function ClusterOperationControls({
  controls,
  error_text,
  is_loading,
  loading_text,
}) {
  return (
    <div className={styles.controls_options_container}>
      <h3> Cluster options: </h3>
      <div className={styles.controls_row}>
        <div className={styles.input_group}>
          <label className={styles.input_label}>Algorithm type</label>
          <select
            className={styles.input_select}
            value={controls.algorithm_type}
            disabled={is_loading}
            onChange={controls.handle_algorithm_change}
          >
            {ALGORITHM_OPTIONS.map((option_row) => (
              <option key={`algorithm-${option_row.id}`} value={option_row.id}>
                {option_row.label}
              </option>
            ))}
          </select>
        </div>

        {!controls.is_advanced_selected && (
          <div className={styles.input_group}>
            <label className={styles.input_label}>k_clusters</label>
            <input
              type="number"
              className={styles.input_number}
              value={controls.k_clusters_value}
              min={1}
              step={1}
              disabled={is_loading}
              onChange={controls.handle_k_clusters_change}
            />
          </div>
        )}

        {controls.can_select_embedder_model &&
          !controls.show_advanced_options && (
            <div className={styles.advanced_btn_wrap}>
              <Button
                variant="primary"
                onClick={controls.toggle_advanced_options}
                disabled={is_loading || controls.is_embedders_loading}
              style={{ marginTop: "23px !important" }}
              
              >
                Advanced options
              </Button>
            </div>
          )}

        {controls.can_select_embedder_model &&
          controls.show_advanced_options && (
            <div className={styles.input_group}>
              <RichSelect
                label="Embedder type"
                value={controls.embedder_type}
                options={controls.embedder_options}
                disabled={is_loading || controls.is_embedders_loading}
                compact={true}
                onChange={controls.handle_embedder_change}
                placeholder="Select embedder"
                unavailable_hover_text="This model is not available on the server"
              />
            </div>
          )}

        {controls.can_select_embedder_model &&
          controls.show_advanced_options && (
            <div className={styles.input_group}>
              <label className={styles.input_label}>Model</label>
              <input
                type="text"
                className={styles.input_select}
                value={controls.model_value}
                disabled={is_loading || controls.is_embedders_loading}
                onChange={controls.handle_model_change}
              />
              <p className={styles.model_hint}>
                Type a model from the available models for the selected
                embedder.
              </p>
              {has_value(
                controls.selected_embedder_row?.external_models_url,
              ) && (
                <a
                  className={styles.embedder_link}
                  href={controls.selected_embedder_row.external_models_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  discover embedding models
                </a>
              )}
            </div>
          )}

        {controls.can_select_embedder_model &&
          controls.show_advanced_options && (
            <Button
              variant="primary"
              onClick={controls.toggle_advanced_options}
              disabled={is_loading || controls.is_embedders_loading}
              style={{ marginTop: "23px" }}
            >
              Hide advanced options
            </Button>
          )}

        {(controls.has_pending_changes || Boolean(error_text)) && (
          <div className={styles.refresh_btn_wrap}>
            <Button
              variant="primary"
              loading={is_loading}
              onClick={controls.handle_refresh}
            >
              Refresh
            </Button>
          </div>
        )}
      </div>

      {controls.validation_error && (
        <p className={styles.validation_text}>{controls.validation_error}</p>
      )}
      {controls.embedder_error_text && (
        <p className={styles.validation_text}>{controls.embedder_error_text}</p>
      )}
      {controls.is_embedders_loading && (
        <p className={styles.info_text}>Loading embedder types...</p>
      )}
      {is_loading && <p className={styles.info_text}>{loading_text}</p>}
      {error_text && <p className={styles.validation_text}>{error_text}</p>}
    </div>
  );
}
