import { useCallback, useMemo, useRef, useState } from "react";
import { DATE_FILTER_PRESETS, get_messages_columns, is_date_in_filter_preset } from "../entities_helpers";
import { useUserContext } from "../../../lib/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { save_telegram_dataset } from "../../../lib/backend/dataset";

import DatesRanges from "./DatesRanges";
import Popup from "../../../components/reusable/Popup/Popup";
import Button from "../../../components/reusable/Button/Button";
import TextInput from "../../../components/reusable/Inputs/TextInput";

import styles from "../Telegram.module.scss";
import { FaChevronCircleDown, FaChevronCircleUp } from "react-icons/fa";
import Senders from "./Senders";
import RowDetailsPopup from "../../../components/page_components/RowDetailsPopup";
import DateFilters from "./DateFilters";
import Keywords from "./Keywords";
import DataTable from "../../../components/reusable/Datatable/Datatable";
import { get_telegram_message_media } from "../../../lib/backend/telegram";
import MessageMediaPreview from "./MessageMediaPreview";
export default function AccountSection({
    account,
    account_idx,
    account_section_open,
    selected_senders_obj,
    account_senders,
    selected_date_filter,
    keywords_loading,
    account_keywords,
    account_selected_keyword_filter,
    keywords_error,
    account_db_messages,
    account_start_date_range_filter,
    account_end_date_range_filter,
    messages_loading,
    get_filtered_messages,
    account_keywords_mapping,
    register_account_section_ref,
    toggle_account_section_open,

    sender_error,
    db_messages_error,

    senders_loading,
    limits_account,
    sender_limit_change_function,
    start_date_range_filter_select_function,
    end_date_range_filter_select_function,
    sender_selected_function,
    date_filter_select_function,
    keyword_filter_select_function

}) {

    const { refreshDatasets, datasets_data } = useUserContext();
    const navigate = useNavigate();



    const account_id = account.account_id;
    const selected_sender_count = Object.values(selected_senders_obj || {}).filter(value => value === true).length;
    const selected_senders = (account_senders || []).filter(sender_row => selected_senders_obj?.[sender_row.chat_id] === true);


    const selected_sender_labels = selected_senders.map((sender_row) => {
        return sender_row?.chat_name || sender_row?.chat_id || "Unknown";
    });



    const selected_date_filter_label =
        DATE_FILTER_PRESETS.find(
            (filter_row) => filter_row.id === selected_date_filter,
        )?.label || "None";


    const [selected_sender_popup_data, set_selected_sender_popup_data] = useState(null);

    // STATES: POPUP DATA
    const [selected_message_popup_data, set_selected_message_popup_data] =
        useState(null);
    const [selected_entity_popup_title, set_selected_entity_popup_title] =
        useState("Entity Details");
    const [selected_message_popup_title, set_selected_message_popup_title] =
        useState("Message Details");
    // STATES: POPUP MEDIA DATA
    const [message_media_url, set_message_media_url] = useState("");
    const [message_media_mime_type, set_message_media_mime_type] = useState("");
    const [message_media_file_name, set_message_media_file_name] = useState("");
    const [message_media_loading, set_message_media_loading] = useState(false);
    const [message_media_error, set_message_media_error] = useState("");
    const [message_media_has_attempted, set_message_media_has_attempted] =
        useState(false);


    const [is_save_popup_visible, set_is_save_popup_visible] = useState(false);
    const [save_dataset_loading, set_save_dataset_loading] = useState(false);
    const [save_dataset_error, set_save_dataset_error] = useState("");
    const [save_dataset_success, set_save_dataset_success] = useState("");
    const [dataset_name, set_dataset_name] = useState("");
    const [dataset_name_error, set_dataset_name_error] = useState("");

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





    const [datatable_filters_state, set_datatable_filters_state] = useState({
        global_filter: "",
        column_filters: [],
        sorting: [],
    });
    const [datatable_filtered_rows, set_datatable_filtered_rows] = useState(null);



    const filtered_messages = get_filtered_messages(
        account_id,
        account_db_messages,
        selected_date_filter,
        account_selected_keyword_filter,
        account_start_date_range_filter,
        account_end_date_range_filter,
        datatable_filtered_rows
    );




    const entity_row_refs = useRef({});
    const message_media_url_ref = useRef("");
    const message_media_request_id_ref = useRef(0);

    const date_filter_count_map = useMemo(() => {
        const res = {};
        DATE_FILTER_PRESETS.forEach(date_filter_row => {
            const counting = filtered_messages.filter(msg => {
                const msg_date = msg?.date;
                if (!msg_date) return false;
                return is_date_in_filter_preset(msg_date, date_filter_row.id);
            });
            res[date_filter_row.id] = counting?.length || 0;
        })
        return res;
    }, [filtered_messages])


    const keyword_filter_count_map = useMemo(() => {
        const res = {};
        account_keywords.forEach(keyword => {
            const k_msgs = account_keywords_mapping?.[keyword] || [];
            const counting = k_msgs.filter(msg_id => {
                const msg_in_filtered = filtered_messages.find(msg => String(msg.message_id) === String(msg_id));
                return Boolean(msg_in_filtered);
            });
            res[keyword] = counting?.length || 0;
        });

        return res;

    }, [filtered_messages, account_keywords, account_keywords_mapping]);

    const messages_columns = useMemo(() => {
        return get_messages_columns();
    }, []);

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


    const filtered_rows_for_save =
        (Array.isArray(datatable_filtered_rows) && datatable_filtered_rows.length > 0) ?
            datatable_filtered_rows : filtered_messages;
    console.log("filtered_rows_for_save: ", filtered_rows_for_save);
    const has_messages_to_save = filtered_rows_for_save.length > 0;

    const is_save_dataset_disabled =
        !dataset_name?.trim() || !has_messages_to_save;


    const show_sender_details = useCallback((sender_row, account_id) => {
        if (!sender_row || !account_id) return;
        set_selected_sender_popup_data(sender_row);
    }, []);
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


    const handle_save_dataset = async (rows_to_save) => {
        const resolved_dataset_name = dataset_name?.trim();

        if (!resolved_dataset_name) {
            set_dataset_name_error("Please provide a dataset name.");
            return;
        }

        if (save_dataset_loading) return;

        set_save_dataset_loading(true);
        set_save_dataset_error("");
        set_save_dataset_success("");
        set_dataset_name_error("");

        const loading_toast_id = toast.loading(
            "Saving your dataset. This can take a few moments...",
        );
        console.log("rows_to_save: " , rows_to_save);
        const tuples = Array.from(
            rows_to_save
                .reduce((acc_value, message_row) => {
                    const entity_id = String(message_row?.chat_id || "");
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


    const cleanup_message_media_url = useCallback(() => {
        if (!message_media_url_ref.current) return;
        URL.revokeObjectURL(message_media_url_ref.current);
        message_media_url_ref.current = "";
    }, []);

    const on_data_table_row_click = useCallback((account_id, message_row) => {
        if (
            !message_row ||
            !account_id ||
            !message_row?.chat_id
        )
            return;


        set_selected_message_popup_data(message_row);
        set_selected_message_popup_title(
            `Message Details - ${ message_row?.chat_id || "Entity"}`,
        );

        cleanup_message_media_url();
        set_message_media_url("");
        set_message_media_mime_type("");
        set_message_media_file_name("");
        set_message_media_error("");
        set_message_media_loading(true);
        set_message_media_has_attempted(false);
        message_media_request_id_ref.current += 1;
        const active_request_id = message_media_request_id_ref.current;

        get_telegram_message_media(
            account_id,
            message_row?.chat_id,
            message_row?.message_id,
        )
            .then((media_response) => {
                if (active_request_id !== message_media_request_id_ref.current)
                    return;
                set_message_media_has_attempted(true);

                if (!media_response?.blob) {
                    return;
                }

                const media_url = URL.createObjectURL(media_response.blob);
                message_media_url_ref.current = media_url;
                set_message_media_url(media_url);
                set_message_media_mime_type(media_response?.mime_type || "");
                set_message_media_file_name(
                    media_response?.file_name || "telegram_media",
                );

            })
            .catch((ex) => {
                if (active_request_id !== message_media_request_id_ref.current)
                    return;
                console.error("[Entities] failed loading message media", {
                    account_id: account_id,
                    entity_id: message_row?.chat_id,
                    message_id: message_row?.message_id,
                    error: ex,
                });
                set_message_media_has_attempted(true);
                set_message_media_error(String(ex || "Unable to load media"));
            })
            .finally(() => {
                if (active_request_id !== message_media_request_id_ref.current)
                    return;
                set_message_media_loading(false);
            });




    }, [cleanup_message_media_url]);


    return (
        <div className={styles.account_section_root}
            ref={(node) => register_account_section_ref(account_id, node)}
            key={account_id}

        >
            <div className={styles.account_section_header} onClick={() => toggle_account_section_open(account_id)}>

                <h1 className={styles.account_title}>
                    {account?.email || `Account ${account_idx + 1}`}
                    <span className={styles.account_subtitle}>
                        Provider: {account?.email_provider_id || "-"}
                    </span>

                </h1>
                <div>
                    {
                        account_section_open ?
                            <FaChevronCircleDown />
                            :
                            <FaChevronCircleUp />
                    }
                </div>

            </div>
            <div className={`${styles.account_section_content} ${account_section_open ? styles.open : ''}`}>
                {
                    sender_error &&
                    <p className="error_note">  {sender_error} </p>
                }
                {
                    db_messages_error &&
                    <p className="error_note">  {db_messages_error} </p>
                }

                <Senders
                    account_id={account_id}
                    senders_loading={senders_loading}
                    account_senders={account_senders || []}
                    selected_senders_map={selected_senders_obj || {}}
                    selected_sender_limits_map={limits_account}
                    filtered_messages={filtered_messages}
                    on_sender_chip_click={(sender_row) => sender_selected_function(sender_row, account_id)}
                    on_sender_limit_change={(sender_row, new_limit) => sender_limit_change_function(sender_row, new_limit, account_id)}
                    on_sender_details_click={(sender_row) => show_sender_details(sender_row, account_id)}

                />

                <DateFilters
                    date_filter_count_map={date_filter_count_map}
                    selected_date_filter={selected_date_filter}
                    on_select_date_filter={(date_filter_id) => date_filter_select_function(date_filter_id, account_id)}
                    chips_disabled={!filtered_messages || filtered_messages.length == 0}


                />

                <DatesRanges
                    start_date_range_filter_value={account_start_date_range_filter}
                    end_date_range_filter_value={account_end_date_range_filter}
                    on_start_date_range_filter_change={(e) => start_date_range_filter_select_function(account_id, e)}
                    on_end_date_range_filter_change={(e) => end_date_range_filter_select_function(account_id, e)}

                />

                <Keywords
                    account_keywords_array={account_keywords}
                    account_keywords_counts_mapping={keyword_filter_count_map}
                    keywords_loading={keywords_loading}
                    selected_keyword_filters={account_selected_keyword_filter}
                    on_select_keyword_filter={(account_keyword) => keyword_filter_select_function(account_id, account_keyword)}
                    keywords_error={keywords_error}
                />


                <DataTable
                    className={styles.datatable_root}
                    title="Messages"
                    subtitle={
                        selected_sender_count > 0
                            ? `Messages for ${selected_sender_count} sender(s) • Showing ${filtered_messages.length} / ${account_db_messages.length}`
                            : "Choose one or more senders to load messages."
                    }
                    columns={messages_columns}
                    data={filtered_messages}
                    loading={messages_loading}
                    row_click={(row) => on_data_table_row_click(account_id, row)}
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
                            onClick={() => handle_save_dataset(filtered_rows_for_save)}
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

               <RowDetailsPopup
                            is_visible={Boolean(selected_sender_popup_data)}
                            close_popup={() => set_selected_sender_popup_data(null)}
                            title={`Sender details - ${selected_sender_popup_data?.chat_name || "Unknown"}`}
                            row_data={selected_sender_popup_data}
                        />
                <RowDetailsPopup
                is_visible={Boolean(selected_message_popup_data)}
                close_popup={() => {
                    message_media_request_id_ref.current += 1;
                    set_selected_message_popup_data(null);
                    cleanup_message_media_url();
                    set_message_media_url("");
                    set_message_media_mime_type("");
                    set_message_media_file_name("");
                    set_message_media_loading(false);
                    set_message_media_error("");
                    set_message_media_has_attempted(false);
                }}
                title={selected_message_popup_title}
                row_data={selected_message_popup_data}
                extra_content={
                    <MessageMediaPreview
                        is_loading={message_media_loading}
                        error_value={message_media_error}
                        media_url={message_media_url}
                        mime_type={message_media_mime_type}
                        file_name={message_media_file_name}
                        has_attempted={message_media_has_attempted}
                    />
                }
            />
        </div>
    )




}
