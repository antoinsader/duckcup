import React, { useMemo, useState } from "react";

import Button from "../../components/reusable/Button/Button";

import styles from "./ImportantTokensSection.module.scss";

const DEFAULT_GRAMS_N = 100;

const is_valid_positive_int = (value) => {
  const number_value = Number(value);
  return Number.isInteger(number_value) && number_value > 0;
};

const format_score = (score_value) => {
  const number_value = Number(score_value);
  if (!Number.isFinite(number_value)) return "0";
  return Number(number_value).toFixed(4);
};

export default function ImportantTokensSection({
  is_loading,
  error_text,
  operation_data,
  on_run_operation,
}) {
  const [grams_n_value, set_grams_n_value] = useState(String(DEFAULT_GRAMS_N));
  const [applied_grams_n_value, set_applied_grams_n_value] = useState(String(DEFAULT_GRAMS_N));
  const [validation_error, set_validation_error] = useState("");

  const has_pending_changes = grams_n_value !== applied_grams_n_value;
  const should_show_refresh = has_pending_changes || Boolean(error_text);

  const chips_tokens = useMemo(() => {
    if (Array.isArray(operation_data)) {
      return [...operation_data].sort((left_row, right_row) => {
        return Number(right_row?.value || 0) - Number(left_row?.value || 0);
      });
    }

    const operation_tokens =
      operation_data && typeof operation_data === "object" ? operation_data : {};
    const fallback_tokens =
      Object.values(operation_tokens).find((value) => Array.isArray(value)) || [];

    return [...fallback_tokens].sort((left_row, right_row) => {
      return Number(right_row?.value || 0) - Number(left_row?.value || 0);
    });
  }, [operation_data]);

  const trigger_operation = (next_grams_n_value) => {
    if (!is_valid_positive_int(next_grams_n_value)) {
      set_validation_error("N grams must be a positive integer.");
      return;
    }

    set_validation_error("");

    const payload = {
      grams_n: Number(next_grams_n_value),
    };

    set_applied_grams_n_value(String(next_grams_n_value));

    console.log("[ImportantTokensSection] refresh clicked", payload);
    on_run_operation?.(payload);
  };

  const trigger_advanced_operation = (next_grams_n_value) => {
    if (!is_valid_positive_int(next_grams_n_value)) {
      set_validation_error("N grams must be a positive integer.");
      return;
    }

    set_validation_error("");

    const payload = {
      grams_n: Number(next_grams_n_value),
      use_advanced_extractor: true,
    };

    set_applied_grams_n_value(String(next_grams_n_value));

    console.log("[ImportantTokensSection] advanced key extractor clicked", payload);
    on_run_operation?.(payload);
  };

  const handle_grams_n_change = (event) => {
    const next_grams_n_value = event.target.value;
    set_grams_n_value(next_grams_n_value);

    if (validation_error) {
      set_validation_error("");
    }
  };

  const handle_refresh_click = () => {
    trigger_operation(grams_n_value);
  };

  const handle_advanced_click = () => {
    trigger_advanced_operation(grams_n_value);
  };

  return (
    <div className={styles.tokens_root}>
     
      <div className={styles.controls_options_container}>
      <h3> Options: </h3>
     
      <div className={styles.controls_row}>
        <div className={styles.input_group}>
          <label className={styles.input_label}>N grams</label>
          <input
            type="number"
            className={styles.input_number}
            value={grams_n_value}
            min={1}
            step={1}
            disabled={is_loading}
            onChange={handle_grams_n_change}
          />
        </div>

        {should_show_refresh && (
          <div className={styles.refresh_btn_wrap}>
            <Button variant="thirdy" loading={is_loading} onClick={handle_refresh_click}>
              Refresh
            </Button>
          </div>
        )}

        <div className={styles.refresh_btn_wrap}>
          <Button variant="primary" loading={is_loading} onClick={handle_advanced_click}>
            Advanced key extractor
          </Button>
        </div>
      </div>

      {validation_error && <p className={styles.validation_text}>{validation_error}</p>}
      {is_loading && <p className={styles.info_text}>Loading important tokens...</p>}
      {error_text && <p className={styles.validation_text}>{error_text}</p>}

      </div>



      <div className={styles.chips_root}>
        {chips_tokens.map((token_row, token_index) => (
          <span
            key={`${String(token_row?.text || "token")}-${token_index}`}
            className={styles.token_chip}
          >
            <span className={styles.token_text}>{token_row?.text || "-"}</span>
            <span className={styles.token_value}>{format_score(token_row?.value)}</span>
          </span>
        ))}
      </div>

      {!is_loading && !error_text && chips_tokens.length === 0 && (
        <p className={styles.info_text}>No tokens returned for selected parameters.</p>
      )}
    </div>
  );
}
