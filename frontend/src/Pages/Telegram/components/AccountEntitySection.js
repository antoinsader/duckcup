import { useEffect, useMemo, useState } from "react";

import { save_telegram_dataset } from "../../../lib/backend/dataset";
import { useUserContext } from "../../../lib/contexts/UserContext";

import Button from "../../../components/reusable/Button/Button";
import DataTable from "../../../components/reusable/Datatable/Datatable";
import TextInput from "../../../components/reusable/Inputs/TextInput";
import Popup from "../../../components/reusable/Popup/Popup";

import AnalysisPanel from "./AnalysisPanel";
import {
  DATE_FILTER_PRESETS,
  build_sidebar_entity_id,
} from "../entities_helpers";

import styles from "../Telegram.module.scss";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Senders from "./Senders";
import DateFilters from "./DateFilters";

export default function AccountEntitySection({
  account_data,
  account_id,
  account_entities,
  selected_senders_map,
  selected_sender_limits_map,
  selected_sender_rows,
  entities_loading,
  messages_loading,
  messages_columns,
  filtered_account_messages,
  account_messages,
  selected_analysis_chips_map,
  selected_analysis_chips_rows,
  selected_date_filter,
  merged_analysis_entities_map,
  merged_entities_descriptions_map,
  analysis_loading,
  analysis_error,
  expanded_analysis_types_by_account,
  date_filtered_message_ids,
  on_toggle_analysis_chip,
  on_select_date_filter,
  on_toggle_analysis_show_more,
  on_sender_chip_click,
  on_sender_limit_change,
  on_sender_details_click,
  on_message_row_click,
  on_register_account_ref,
  on_register_entity_ref,
}) {
  const { refreshDatasets, datasets_data } = useUserContext();
  const navigate = useNavigate();

  const [is_save_popup_visible, set_is_save_popup_visible] = useState(false);
  const [save_dataset_loading, set_save_dataset_loading] = useState(false);
  const [save_dataset_error, set_save_dataset_error] = useState("");
  const [save_dataset_success, set_save_dataset_success] = useState("");
  const [dataset_name, set_dataset_name] = useState("");
  const [dataset_name_error, set_dataset_name_error] = useState("");
  const [datatable_filtered_rows, set_datatable_filtered_rows] = useState(null);
  const [datatable_filters_state, set_datatable_filters_state] = useState({
    global_filter: "",
    column_filters: [],
    sorting: [],
  });
  const selected_sender_count = selected_sender_rows.length;
  const has_selected_senders =
    Array.isArray(selected_sender_rows) && selected_sender_rows.length > 0;


  const filtered_rows_for_save = Array.isArray(datatable_filtered_rows)
    ? datatable_filtered_rows
    : filtered_account_messages;

  const has_messages_to_save = filtered_rows_for_save.length > 0;
  const is_save_dataset_disabled =
    !dataset_name?.trim() || !has_messages_to_save;

  const selected_sender_labels = selected_sender_rows.map((sender_row) => {
    return sender_row?.chat_name || sender_row?.chat_id || "Unknown";
  });

  const selected_entity_filter_labels = selected_analysis_chips_rows.map(
    (chip_row) => {
      return `${chip_row?.entity_label || "Entity"}: ${chip_row?.entity_text || "Value"}`;
    },
  );

  const selected_date_filter_label =
    DATE_FILTER_PRESETS.find(
      (filter_row) => filter_row.id === selected_date_filter,
    )?.label || "None";

  const dataset_name_suggestions = useMemo(() => {
    const base_suggestions = [
      "TelegramDsAlpha",
      "TelegramDsBeta",
      "TelegramDsGamma",
    ];
    const existing_names = new Set(
      (datasets_data || [])
        .map((dataset_item) =>
          String(dataset_item?.ds_name || dataset_item?.dataset_name || "")
            .trim()
            .toLowerCase(),
        )
        .filter(Boolean),
    );

    return base_suggestions.filter(
      (suggestion_item) => !existing_names.has(suggestion_item.toLowerCase()),
    );
  }, [datasets_data]);

  const column_labels_by_field = useMemo(() => {
    return (messages_columns || []).reduce((acc_value, column_row) => {
      const field_name = String(column_row?.field || "");
      if (!field_name) return acc_value;
      acc_value[field_name] = column_row?.label || field_name;
      return acc_value;
    }, {});
  }, [messages_columns]);

  const active_datatable_filters = useMemo(() => {
    const global_filter_value = String(
      datatable_filters_state?.global_filter || "",
    ).trim();
    const column_filters_values = Array.isArray(
      datatable_filters_state?.column_filters,
    )
      ? datatable_filters_state.column_filters
      : [];

    return {
      global_filter: global_filter_value,
      column_filters: column_filters_values
        .filter((filter_row) => String(filter_row?.value || "").trim())
        .map((filter_row) => ({
          field: filter_row?.id,
          label:
            column_labels_by_field[filter_row?.id] ||
            filter_row?.id ||
            "Column",
          value: String(filter_row?.value || "").trim(),
        })),
    };
  }, [column_labels_by_field, datatable_filters_state]);

  const has_active_datatable_filters =
    Boolean(active_datatable_filters.global_filter) ||
    active_datatable_filters.column_filters.length > 0;

  const open_save_dataset_popup = () => {
    set_save_dataset_error("");
    set_save_dataset_success("");
    set_dataset_name("");
    set_dataset_name_error("");
    set_is_save_popup_visible(true);
  };

  const close_save_dataset_popup = () => {
    if (save_dataset_loading) return;
    set_dataset_name("");
    set_dataset_name_error("");
    set_is_save_popup_visible(false);
  };

  const handle_save_dataset = async () => {
    const resolved_dataset_name = dataset_name?.trim();

    if (!resolved_dataset_name) {
      set_dataset_name_error("Please provide a dataset name.");
      return;
    }

    if (!has_messages_to_save || save_dataset_loading) return;

    set_save_dataset_loading(true);
    set_save_dataset_error("");
    set_save_dataset_success("");
    set_dataset_name_error("");

    const loading_toast_id = toast.loading(
      "Saving your dataset. This can take a few moments...",
    );

    const tuples = Array.from(
      filtered_rows_for_save
        .reduce((acc_value, message_row) => {
          const entity_id = String(message_row?.__entity_chat_id || "");
          const message_id = String(message_row?.message_id || "");
          if (!entity_id || !message_id) return acc_value;

          acc_value.set(`${entity_id}::${message_id}`, {
            entity_id,
            message_id,
          });
          return acc_value;
        }, new Map())
        .values(),
    );

    try {
      const save_result = await save_telegram_dataset({
        account_id,
        dataset_name: resolved_dataset_name,
        tuples,
      });

      if (save_result?.dataset_id) {
        toast.success(
          `Dataset "${resolved_dataset_name}" saved successfully.`,
          {
            id: loading_toast_id,
          },
        );
        set_save_dataset_success(
          `Dataset "${resolved_dataset_name}" saved successfully with ${tuples.length} messages.`,
        );
        await refreshDatasets?.();
        navigate("/datasets");

        console.log("[Entities] dataset saved", {
          account_id,
          dataset_name: resolved_dataset_name,
          tuples_count: tuples.length,
        });
        return;
      }

      const error_message =
        String(save_result?.message) ||
        "Unable to save dataset. Please try again.";
      set_save_dataset_error(error_message);
      toast.error(error_message, { id: loading_toast_id });

      console.error("[Dataset] save inbox dataset failed", {
        account_id,
        response: save_result,
      });
    } catch (ex) {
      set_save_dataset_error(
        String(ex || "Unable to save dataset. Please try again."),
      );
      const error_message =
        String(ex?.message) || "Unable to save dataset. Please try again.";

      console.error("[Entities] save dataset failed", {
        account_id,
        error: ex,
      });
      toast.error(error_message, { id: loading_toast_id });
    } finally {
      set_save_dataset_loading(false);
    }
  };

   const has_active_date_filter = Boolean(selected_date_filter);
  const allowed_message_ids =
    has_active_date_filter && date_filtered_message_ids instanceof Set
      ? date_filtered_message_ids
      : null;

  const section_header = (
    <div className={styles.account_section_header}>
      <h1 className={styles.account_title}>
        {account_data?.email || "Account"}
      </h1>
      <span className={styles.account_subtitle}>
        Provider: {account_data?.email_provider_id || "-"}
      </span>
    </div>
  );

  const section_content = (
    <div className={styles.account_section_content}>
      <div
        className={styles.table_container}
        ref={(node) => on_register_account_ref(account_id, node)}
      >
        {/* <Senders
          account_id={account_id}
          entities_loading={entities_loading}
          account_entities={account_entities}
          selected_senders_map={selected_senders_map}
          selected_sender_count={selected_sender_count}
          selected_sender_limits_map={selected_sender_limits_map}
          filtered_rows_for_save={filtered_rows_for_save}
          on_sender_chip_click={on_sender_chip_click}
          on_sender_limit_change={on_sender_limit_change}
          on_sender_details_click={on_sender_details_click}
          build_sidebar_entity_id={build_sidebar_entity_id}
        /> */}
      </div>

      <div className={styles.table_container}>

        
      <div className={styles.analysis_date_card_root}>
        {has_selected_senders ? (
          <>
         
            <DateFilters
              account_id={account_id}
              filtered_account_messages={filtered_account_messages}
              selected_date_filter={selected_date_filter}
              on_select_date_filter={(date_filter_id) =>
                on_select_date_filter(account_id, date_filter_id)
              }
              chips_disabled={analysis_loading || !has_selected_senders}
            />
          </>
        ) : (
          <div className={styles.analysis_empty_state}>
            Choose an entity to enable date filters.
          </div>
        )}
      </div>


        <AnalysisPanel
          account_id={account_id}
          has_selected_senders={has_selected_senders}
          analysis_entities_map={merged_analysis_entities_map}
          entities_descriptions_map={merged_entities_descriptions_map}
          analysis_loading={analysis_loading}
          analysis_error={analysis_error}
          selected_analysis_chips_map={selected_analysis_chips_map}
          selected_analysis_chips_rows={selected_analysis_chips_rows}
          expanded_analysis_types_by_account={
            expanded_analysis_types_by_account
          }
          on_toggle_analysis_chip={on_toggle_analysis_chip}
          on_toggle_analysis_show_more={on_toggle_analysis_show_more}

          allowed_message_ids={allowed_message_ids}
        />

        <DataTable
          className={styles.datatable_root}
          title="Messages"
          subtitle={
            selected_sender_count > 0
              ? `Messages for ${selected_sender_count} sender(s) • Showing ${filtered_account_messages.length} / ${account_messages.length}`
              : "Choose one or more senders to load messages."
          }
          columns={messages_columns}
          data={selected_sender_count > 0 ? filtered_account_messages : []}
          loading={messages_loading}
          row_click={on_message_row_click}
          customBtns={[
            {
              key: "save_messages_dataset",
              label: "Save dataset",
              class: styles.messages_save_btn,
              hide: selected_sender_count === 0,
              onClick: open_save_dataset_popup,
            },
          ]}
          on_filters_state_change={set_datatable_filters_state}
          on_filtered_data_change={set_datatable_filtered_rows}
        />
      </div>

      <div className={styles.entity_refs_hidden_root}>
        {account_entities.map((entity_row) => {
          const sidebar_entity_id = build_sidebar_entity_id(
            account_id,
            entity_row?.chat_id,
          );

          return (
            <span
              key={sidebar_entity_id}
              ref={(node) => on_register_entity_ref(sidebar_entity_id, node)}
            />
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <div className={styles.account_section_root}>
        {section_header}
        {section_content}
      </div>

      <Popup
        title="Save messages dataset"
        isVisible={is_save_popup_visible}
        closePopup={close_save_dataset_popup}
        popupContainerStyle={{ maxWidth: "720px", width: "94%" }}
        footer={
          <div className={styles.save_popup_actions_root}>
            <Button
              variant="secondary"
              onClick={close_save_dataset_popup}
              disabled={save_dataset_loading}
              btnClass={styles.save_popup_cancel_btn}
            >
              Cancel
            </Button>
            <Button
              onClick={handle_save_dataset}
              loading={save_dataset_loading}
              disabled={is_save_dataset_disabled}
              btnClass={styles.save_popup_save_btn}
            >
              Save
            </Button>
          </div>
        }
      >
        {save_dataset_error ? (
          <p className={styles.save_popup_error}>Error: {save_dataset_error}</p>
        ) : null}
        {save_dataset_success ? (
          <p className={styles.save_popup_success}>{save_dataset_success}</p>
        ) : null}
        <div className={styles.save_popup_root}>
          <div className={styles.save_popup_metrics_block}>
            <p className={styles.save_popup_title}>Rows selected</p>
            <p className={styles.save_popup_metric_value}>
              {filtered_rows_for_save.length}
            </p>
          </div>

          <div className={styles.save_popup_block}>
            <p className={styles.save_popup_title}>Dataset name</p>
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

          <div className={styles.save_popup_block}>
            <p className={styles.save_popup_title}>Selected senders</p>
            {selected_sender_labels.length > 0 ? (
              <div className={styles.save_popup_senders_chips_row}>
                {selected_sender_labels.map((sender_label) => (
                  <span
                    key={sender_label}
                    className={styles.save_popup_sender_chip}
                  >
                    {sender_label}
                  </span>
                ))}
              </div>
            ) : (
              <p className={styles.save_popup_text}>No sender selected</p>
            )}
          </div>

          <div className={styles.save_popup_block}>
            <p className={styles.save_popup_title}>Date filter</p>
            <p className={styles.save_popup_text}>
              {selected_date_filter_label}
            </p>
          </div>

          <div className={styles.save_popup_block}>
            <p className={styles.save_popup_title}>Entity type filters</p>
            <p className={styles.save_popup_text}>
              {selected_entity_filter_labels.length > 0
                ? selected_entity_filter_labels.join(", ")
                : "No entity filters selected"}
            </p>
          </div>

          <div className={styles.save_popup_block}>
            <p className={styles.save_popup_title}>Table filters</p>
            {has_active_datatable_filters ? (
              <div className={styles.save_popup_filters_root}>
                {active_datatable_filters.global_filter ? (
                  <p className={styles.save_popup_text}>
                    Global search: {active_datatable_filters.global_filter}
                  </p>
                ) : null}
                {active_datatable_filters.column_filters.map((filter_row) => (
                  <p key={filter_row.field} className={styles.save_popup_text}>
                    {filter_row.label}: {filter_row.value}
                  </p>
                ))}
              </div>
            ) : (
              <p className={styles.save_popup_text}>No table filters applied</p>
            )}
          </div>

          <div className={styles.save_popup_warning_root}>
            <p className={styles.save_popup_warning_title}>
              Encrypted server storage
            </p>
            <ul className={styles.save_popup_warning_list}>
              <li>
                This dataset will be stored on our servers to support future
                analysis.
              </li>
              <li>Stored tuples are encrypted while saved on the server.</li>
            </ul>
          </div>
        </div>
      </Popup>
    </>
  );
}
