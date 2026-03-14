import React, { useMemo } from "react";

import ClusterCard from "./ClusterCard";
import ClusterOperationControls from "./ClusterOperationControls";
import useClusterControls from "./useClusterControls";

import local_styles from "./ClustersAllSection.module.scss";
import styles from "./ClustersShared.module.scss";

export default function ClustersAllSection({
  dataset_id,
  is_loading,
  error_text,
  operation_data,
  on_run_operation,
  is_telegram_dataset,
}) {
  const controls = useClusterControls({
    on_run_operation,
    log_prefix: "ClustersAllSection",
  });

  const clusters_rows = useMemo(() => {
    return Array.isArray(operation_data) ? operation_data : [];
  }, [operation_data]);

  return (
    <div className={styles.section_root}>
      <ClusterOperationControls
        controls={controls}
        error_text={error_text}
        is_loading={is_loading}
        loading_text="Loading all clusters..."
      />

      <div className={styles.clusters_grid}>
        {clusters_rows.map((cluster_row, cluster_index) => {
          return (
            <ClusterCard
              key={`cluster-all-${cluster_index}`}
              key_prefix="cluster-all"
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

      {!is_loading && !error_text && clusters_rows.length === 0 && (
        <p className={styles.info_text}>
          No clusters returned for selected parameters.
        </p>
      )}
    </div>
  );
}
