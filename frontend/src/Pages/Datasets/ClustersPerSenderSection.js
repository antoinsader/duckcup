import React, { useMemo } from "react";

import ClusterCard from "./ClusterCard";
import ClusterOperationControls from "./ClusterOperationControls";
import useClusterControls from "./useClusterControls";

import local_styles from "./ClustersPerSenderSection.module.scss";
import styles from "./ClustersShared.module.scss";

export default function ClustersPerSenderSection({
  dataset_id,
  is_loading,
  error_text,
  operation_data,
  on_run_operation,
  is_telegram_dataset,
}) {
  const controls = useClusterControls({
    on_run_operation,
    log_prefix: "ClustersPerSenderSection",
  });

  const sender_rows = useMemo(() => {
    return Array.isArray(operation_data) ? operation_data : [];
  }, [operation_data]);

  return (
    <div className={styles.section_root}>
      <ClusterOperationControls
        controls={controls}
        error_text={error_text}
        is_loading={is_loading}
        loading_text="Loading sender clusters..."
      />

      <div className={local_styles.senders_root}>
        {sender_rows.map((sender_row, sender_index) => {
          const sender_label =
            sender_row?.sender || `Sender ${sender_index + 1}`;
          const sender_clusters = Array.isArray(sender_row?.clusters)
            ? sender_row?.clusters
            : [];

          return (
            <div
              key={`sender-${sender_label}-${sender_index}`}
              className={local_styles.sender_block}
            >
              <h1 className={local_styles.sender_title}>{sender_label}</h1>

              <div className={styles.clusters_grid}>
                {sender_clusters.map((cluster_row, cluster_index) => {
                  return (
                    <ClusterCard
                      key={`cluster-${sender_label}-${cluster_index}`}
                      key_prefix={`sender-${sender_label}`}
                      dataset_id={dataset_id}
                      cluster_index={cluster_index}
                      cluster_row={cluster_row}
                      is_loading={is_loading}
                      error_text={error_text}
                      is_telegram_dataset={is_telegram_dataset}
                      card_class_name={local_styles.cluster_card_spacing}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {!is_loading && !error_text && sender_rows.length === 0 && (
        <p className={styles.info_text}>
          No sender clusters returned for selected parameters.
        </p>
      )}
    </div>
  );
}
