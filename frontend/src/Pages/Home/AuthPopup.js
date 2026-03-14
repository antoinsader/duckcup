import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import Popup from "../../components/reusable/Popup/Popup";
import { apiRequest } from "../../lib/api/api";

import styles from "./Home.module.scss";

const getInputType = (field_type) => {
  if (["text", "number", "password"].includes(field_type)) {
    return field_type;
  }
  return "text";
};

const buildRequestBody = (state_value, fields, form_values) => {
  const body = {
    state: state_value,
  };

  fields.forEach((field) => {
    body[field.name] = form_values[field.name] ?? "";
  });

  return body;
};

export default function AuthPopup({
  is_visible,
  close_popup,
  provider,
  provider_redirect_url,
  on_success,
}) {
  const [is_loading_schema, set_is_loading_schema] = useState(false);
  const [is_submitting, set_is_submitting] = useState(false);
  const [error_message, set_error_message] = useState("");

  const [flow_stage, set_flow_stage] = useState("initial");
  const [flow_state, set_flow_state] = useState("");
  const [next_route, set_next_route] = useState("");
  const [fields, set_fields] = useState([]);
  const [form_values, set_form_values] = useState({});
  const [show_password_fields, set_show_password_fields] = useState({});
  const [warnings, set_warnings] = useState([]);

  const resetPopupState = useCallback(() => {
    set_is_loading_schema(false);
    set_is_submitting(false);
    set_error_message("");
    set_flow_stage("initial");
    set_flow_state("");
    set_next_route("");
    set_fields([]);
    set_form_values({});
    set_show_password_fields({});
    set_warnings([]);
  }, []);

  const hydrateFormValues = useCallback((new_fields, prev_values = {}) => {
    const next_values = {};
    (Array.isArray(new_fields) ? new_fields : []).forEach((field) => {
      next_values[field.name] = prev_values[field.name] ?? "";
    });
    return next_values;
  }, []);

  const loadInitialSchema = useCallback(async () => {
    if (!provider_redirect_url) {
      set_error_message("Missing authentication route");
      return;
    }

    set_is_loading_schema(true);
    set_error_message("");
    set_warnings([]);

    const schema_res = await apiRequest({
      method: "GET",
      route: provider_redirect_url,
    });

    if (!schema_res || typeof schema_res !== "object") {
      set_error_message(
        typeof schema_res === "string"
          ? schema_res
          : "Unable to load authentication form",
      );
      set_is_loading_schema(false);
      return;
    }

    if (!Array.isArray(schema_res.fields) || !schema_res.next_route) {
      set_error_message("Authentication schema is invalid");
      set_is_loading_schema(false);
      return;
    }

    set_flow_stage("initial");
    set_flow_state(schema_res.state || "");
    set_next_route(schema_res.next_route || "");
    set_fields(schema_res.fields);
    set_form_values(hydrateFormValues(schema_res.fields));
    set_is_loading_schema(false);
  }, [hydrateFormValues, provider_redirect_url]);

  useEffect(() => {
    if (is_visible) {
      resetPopupState();
      loadInitialSchema();
    }
  }, [is_visible, loadInitialSchema, resetPopupState]);

  const canSubmit = useMemo(() => {
    if (!Array.isArray(fields) || fields.length === 0) return false;

    return fields.every((field) => {
      if (!field.required) return true;
      const value = form_values[field.name];
      return value !== undefined && value !== null && String(value).trim() !== "";
    });
  }, [fields, form_values]);

  const updateFieldValue = useCallback((field_name, value) => {
    set_form_values((prev_values) => ({
      ...prev_values,
      [field_name]: value,
    }));
  }, []);

  const togglePasswordFieldVisibility = useCallback((field_name) => {
    set_show_password_fields((prev_values) => ({
      ...prev_values,
      [field_name]: !prev_values[field_name],
    }));
  }, []);

  const submitInitialStep = useCallback(async () => {
    if (!next_route) {
      set_error_message("Missing next route for authentication");
      return;
    }

    const req_body = buildRequestBody(flow_state, fields, form_values);
    const step_res = await apiRequest({
      method: "POST",
      route: next_route,
      body: req_body,
    });

    if (!step_res || typeof step_res !== "object") {
      set_error_message(
        typeof step_res === "string" ? step_res : "Unable to submit credentials",
      );
      return;
    }

    if (step_res.account_id) {
      toast.success("Login completed successfully");
      on_success?.(step_res);
      close_popup?.();
      return;
    }

    if (!Array.isArray(step_res.fields)) {
      set_error_message("Invalid response from authentication step");
      return;
    }

    set_flow_stage("verify");
    set_flow_state(step_res.state || flow_state);
    set_fields(step_res.fields);
    set_form_values((prev_values) =>
      hydrateFormValues(step_res.fields, prev_values),
    );
    set_warnings(Array.isArray(step_res.warnings) ? step_res.warnings : []);
  }, [
    close_popup,
    fields,
    flow_state,
    form_values,
    hydrateFormValues,
    next_route,
    on_success,
  ]);

  const submitVerifyStep = useCallback(async () => {
    if (!provider?.verify_route) {
      set_error_message("Missing provider verify route");
      return;
    }

    const req_body = buildRequestBody(flow_state, fields, form_values);
    const verify_res = await apiRequest({
      method: "POST",
      route: provider.verify_route,
      body: req_body,
    });

    if (verify_res?.account_id) {
      toast.success("Login completed successfully");
      on_success?.(verify_res);
      close_popup?.();
      return;
    }

    if (verify_res && typeof verify_res === "object" && Array.isArray(verify_res.fields)) {
      set_flow_stage("verify");
      set_flow_state(verify_res.state || flow_state);
      set_fields(verify_res.fields);
      set_form_values((prev_values) =>
        hydrateFormValues(verify_res.fields, prev_values),
      );
      set_warnings(Array.isArray(verify_res.warnings) ? verify_res.warnings : []);
      set_error_message("");
      return;
    }

    set_error_message(
      typeof verify_res === "string"
        ? verify_res
        : "Authentication verification failed",
    );
  }, [
    close_popup,
    fields,
    flow_state,
    form_values,
    hydrateFormValues,
    on_success,
    provider,
  ]);

  const submitFlow = useCallback(async () => {
    if (!canSubmit || is_submitting) return;

    set_is_submitting(true);
    set_error_message("");

    try {
      if (flow_stage === "initial") {
        await submitInitialStep();
      } else {
        await submitVerifyStep();
      }
    } finally {
      set_is_submitting(false);
    }
  }, [
    canSubmit,
    flow_stage,
    is_submitting,
    submitInitialStep,
    submitVerifyStep,
  ]);

  const submitLabel = flow_stage === "initial" ? "Continue" : "Verify";

  return (
    <Popup
      title={`Authenticate ${provider?.label || "account"}`}
      isVisible={is_visible}
      closePopup={close_popup}
    >
      <div className={styles.auth_popup_container}>
        <div className={styles.auth_security_message}>
          All connections to the server are encoded, and secrets entered here are encrypted.
        </div>

        {is_loading_schema ? (
          <div className={styles.auth_loading}>Loading authentication form...</div>
        ) : (
          <>
            {error_message ? (
              <div className={styles.auth_error}>{error_message}</div>
            ) : null}

            {warnings.length > 0 ? (
              <div className={styles.auth_warnings}>
                {warnings.map((warning, index) => (
                  <div key={`${warning}-${index}`} className={styles.auth_warning_item}>
                    {warning}
                  </div>
                ))}
              </div>
            ) : null}

            <div className={styles.auth_form_fields}>
              {fields.map((field) => (
                <label key={field.name} className={styles.auth_field_row}>
                  <span className={styles.auth_field_label}>
                    {field.label}
                    {field.required ? " *" : ""}
                  </span>
                  <div className={styles.auth_input_row}>
                    <input
                      className={styles.auth_field_input}
                      type={
                        field.type === "password"
                          ? show_password_fields[field.name]
                            ? "text"
                            : "password"
                          : getInputType(field.type)
                      }
                      value={form_values[field.name] ?? ""}
                      required={Boolean(field.required)}
                      placeholder={field.placeholder || ""}
                      disabled={is_submitting}
                      onChange={(e) => updateFieldValue(field.name, e.target.value)}
                    />

                    {field.type === "password" ? (
                      <button
                        type="button"
                        className={styles.auth_password_toggle}
                        onClick={() => togglePasswordFieldVisibility(field.name)}
                        disabled={is_submitting}
                        aria-label={
                          show_password_fields[field.name]
                            ? "Hide password"
                            : "Show password"
                        }
                        title={
                          show_password_fields[field.name]
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {show_password_fields[field.name] ? "🙈" : "👁"}
                      </button>
                    ) : null}
                  </div>
                </label>
              ))}
            </div>
          </>
        )}

        <div className={styles.popup_footer}>
          <button
            className="btn"
            onClick={close_popup}
            disabled={is_submitting}
          >
            Cancel
          </button>
          <button
            className="btn primary"
            onClick={submitFlow}
            disabled={!canSubmit || is_submitting || is_loading_schema}
          >
            {is_submitting ? "Submitting..." : submitLabel}
          </button>
        </div>
      </div>
    </Popup>
  );
}
