import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiInfo } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { insert_inbox_dataset } from "../../lib/backend/dataset";
import { useUserContext } from "../../lib/contexts/UserContext";

import Button from "../../components/reusable/Button/Button";
import TextInput from "../../components/reusable/Inputs/TextInput";
import Popup from "../../components/reusable/Popup/Popup";

import styles from "./Emails.module.scss";

export default function SaveInboxPopup({
  is_visible,
  close_popup,
  account_id,
  criteria_data,
  total_emails_for_dataset,
}) {
  const { refreshDatasets, datasets_data } = useUserContext();
  const navigate = useNavigate();

  const [is_analyze_info_popup_visible, set_is_analyze_info_popup_visible] = useState(false);
  const [dataset_name, set_dataset_name] = useState("");
  const [dataset_name_error, set_dataset_name_error] = useState("");
  const [save_dataset_loading, set_save_dataset_loading] = useState(false);

  const criteria_entries = useMemo(() => {
    const format_label = (field_name = "") => {
      return field_name
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const is_empty_value = (value) => {
      if (value === null || value === undefined) return true;
      if (typeof value === "string") return value.trim() === "";
      if (Array.isArray(value)) return value.length === 0;
      if (typeof value === "object") return Object.keys(value).length === 0;
      return false;
    };

    const format_value = (value) => {
      if (Array.isArray(value)) return value.join(", ");
      if (typeof value === "object") return JSON.stringify(value);
      return String(value);
    };

    return Object.entries(criteria_data || {})
      .filter(([, value]) => !is_empty_value(value))
      .map(([key, value]) => ({
        key,
        label: format_label(key),
        value: format_value(value),
      }));
  }, [criteria_data]);

  const dataset_name_suggestions = useMemo(() => {
    const base_suggestions = ["AlphaDs", "BetaDs", "GammaDs", "DeltaDs"];

    const existing_names = new Set(
      (datasets_data || [])
        .map((dataset_item) =>
          String(dataset_item?.ds_name || dataset_item?.dataset_name || "")
            .trim()
            .toLowerCase()
        )
        .filter(Boolean)
    );

    return base_suggestions.filter(
      (suggestion_item) => !existing_names.has(suggestion_item.toLowerCase())
    );
  }, [datasets_data]);

  const is_save_dataset_disabled = useMemo(() => {
    return !dataset_name?.trim();
  }, [dataset_name]);

  const close_analyze_popup = useCallback(() => {
    if (save_dataset_loading) return;

    set_dataset_name("");
    set_dataset_name_error("");
    close_popup?.();
  }, [close_popup, save_dataset_loading]);

  const save_inbox_dataset = useCallback(async () => {
    const resolved_dataset_name = dataset_name?.trim();

    if (!resolved_dataset_name) {
      set_dataset_name_error("Please provide a dataset name.");
      return;
    }

    set_dataset_name_error("");
    set_save_dataset_loading(true);
    const loading_toast_id = toast.loading(
      "Saving your dataset. This can take a few moments..."
    );

    try {
      const new_dataset = await insert_inbox_dataset({
        criteria: criteria_data,
        account_id,
        dataset_name: resolved_dataset_name,
      });

      if (new_dataset?.dataset_id) {
        toast.success(`Dataset "${resolved_dataset_name}" saved successfully.`, {
          id: loading_toast_id,
        });
        await refreshDatasets?.();
        close_analyze_popup();
        navigate("/datasets");
        console.log("[Dataset] save inbox dataset success", {
          account_id,
          dataset_id: new_dataset.dataset_id,
        });
        return;
      }

      const error_message =
        new_dataset?.message || "Unable to save dataset. Please try again.";
      set_dataset_name_error(error_message);
      toast.error(error_message, { id: loading_toast_id });
      console.error("[Dataset] save inbox dataset failed", {
        account_id,
        response: new_dataset,
      });
    } catch (ex) {
      const error_message =
        ex?.message || "Unable to save dataset. Please try again.";
      set_dataset_name_error(error_message);
      toast.error(error_message, { id: loading_toast_id });
      console.error("[Dataset] save inbox dataset error", ex);
    } finally {
      set_save_dataset_loading(false);
    }
  }, [
    account_id,
    close_analyze_popup,
    criteria_data,
    dataset_name,
    navigate,
    refreshDatasets,
  ]);

  return (
    <>
      <Popup
        title="Save Inbox dataset"
        isVisible={is_visible}
        closePopup={close_analyze_popup}
        popupContainerStyle={{ maxWidth: "720px", width: "94%" }}
      >
        <div className={styles.analyze_popup_root}>
          <div className={styles.analyze_message_block}>
            <p className={styles.analyze_message_title}>Dataset preparation</p>
            <p className={styles.analyze_message_text}>
              We will create and save a dataset so you can analyze your inbox more
              quickly in future sessions.
            </p>
            <button
              type="button"
              className={styles.learn_more_btn}
              onClick={() => set_is_analyze_info_popup_visible(true)}
            >
              <FiInfo /> Learn more
            </button>
          </div>

          <div className={styles.analyze_summary_block}>
            <p className={styles.analyze_message_title}>Dataset scope</p>
            <p className={styles.analyze_message_text}>
              Total emails included: <strong>{total_emails_for_dataset}</strong>
            </p>

            <div className={styles.criteria_summary_root}>
              <p className={styles.criteria_summary_title}>Selected criteria</p>
              {criteria_entries.length ? (
                <ul className={styles.criteria_list}>
                  {criteria_entries.map((criteria_item) => (
                    <li key={criteria_item.key} className={styles.criteria_item}>
                      <span className={styles.criteria_label}>{criteria_item.label}:</span>{" "}
                      <span className={styles.criteria_value}>{criteria_item.value}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.criteria_whole_inbox}>
                  Whole inbox (no filters applied)
                </p>
              )}
            </div>
          </div>

          <div className={styles.analyze_message_block}>
            <p className={styles.analyze_message_text}>
              Only English emails are currently included in dataset analysis,
              because English is the only supported language at this stage.
            </p>
          </div>

          <div className={styles.dataset_input_root}>
            <TextInput
              label="Dataset name"
              value={dataset_name}
              onChange={(value) => {
                set_dataset_name(value);
                if (dataset_name_error) set_dataset_name_error("");
              }}
              placeholder="Enter dataset name"
              required={true}
              error={dataset_name_error}
              suggestions={dataset_name_suggestions}
            />
          </div>

          <div className={styles.dataset_actions_root}>
            <Button
              variant="secondary"
              onClick={close_analyze_popup}
              disabled={save_dataset_loading}
            >
              Cancel
            </Button>
            <Button
              loading={save_dataset_loading}
              onClick={save_inbox_dataset}
              disabled={is_save_dataset_disabled}
            >
              Save dataset
            </Button>
          </div>
        </div>
      </Popup>

      <Popup
        title="About dataset storage"
        isVisible={is_analyze_info_popup_visible}
        closePopup={() => set_is_analyze_info_popup_visible(false)}
        popupContainerStyle={{ maxWidth: "680px", width: "92%" }}
      >
        <div className={styles.learn_more_popup_root}>
          <p className={styles.learn_more_intro}>
            When you save a dataset, we prepare a snapshot of your inbox based on
            the selected criteria.
          </p>
          <ul className={styles.learn_more_list}>
            <li>
              The dataset includes inbox emails according to your selected
              criteria, up to <strong>{total_emails_for_dataset}</strong> emails.
            </li>
            <li>
              The dataset is stored on our servers so you can access and analyze it
              more easily in future sessions.
            </li>
            <li>
              Inbox content stored on our servers is fully encrypted.
            </li>
          </ul>
        </div>
      </Popup>
    </>
  );
}
