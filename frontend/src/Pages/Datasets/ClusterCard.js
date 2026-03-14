import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaMagic } from "react-icons/fa";
import toast from "react-hot-toast";

import RichSelect from "../../components/reusable/Inputs/RichSelect";

import Button from "../../components/reusable/Button/Button";
import Popup from "../../components/reusable/Popup/Popup";
import SetKeyPopup from "../../components/reusable/SetKeyPopup/SetKeyPopup";
import {
  get_rsa_public_key,
  get_saved_keys,
  save_encrypted_key,
} from "../../lib/backend/keys";
import {
  get_cluster_prompt,
  get_group_messages_summarize_prompt,
  get_group_messages_summary,
} from "../../lib/backend/nlp";
import {
  get_hf_text_models,
  get_pollination_text_models,
} from "../../lib/backend/meta";
import { api_tokens } from "../../lib/config/api_tokens";
import { encryptWithPublicKey } from "../../lib/encryption/encrypt";
import { build_message_preview, has_value } from "./clusters_shared";

import styles from "./ClustersShared.module.scss";

export default function ClusterCard({
  card_class_name,
  dataset_id,
  cluster_index,
  cluster_row,
  error_text,
  is_loading,
  is_telegram_dataset,
  key_prefix,
}) {
  const [is_ai_popup_visible, set_is_ai_popup_visible] = useState(false);
  const [is_refine_panel_visible, set_is_refine_panel_visible] = useState(false);
  const [is_refine_bootstrap_loading, set_is_refine_bootstrap_loading] = useState(false);
  const [is_refine_loading, set_is_refine_loading] = useState(false);
  const [provider_options, set_provider_options] = useState([]);
  const [selected_provider, set_selected_provider] = useState("");
  const [model_options, set_model_options] = useState([]);
  const [is_models_loading, set_is_models_loading] = useState(false);
  const [saved_keys_loading, set_saved_keys_loading] = useState(false);
  const [hf_key_available, set_hf_key_available] = useState(false);
  const [pollination_key_available, set_pollination_key_available] = useState(false);
  const [key_to_insert_obj, set_key_to_insert_obj] = useState(null);
  const [selected_model, set_selected_model] = useState("");
  const [refine_error_text, set_refine_error_text] = useState("");
  const [generated_prompt, set_generated_prompt] = useState("");
  const [generated_title, set_generated_title] = useState("");
  const [refined_cluster_title, set_refined_cluster_title] = useState("");
  const [is_summarize_panel_visible, set_is_summarize_panel_visible] = useState(false);
  const [is_summarize_bootstrap_loading, set_is_summarize_bootstrap_loading] = useState(false);
  const [is_summarize_prompt_loading, set_is_summarize_prompt_loading] = useState(false);
  const [is_summarize_loading, set_is_summarize_loading] = useState(false);
  const [summarize_error_text, set_summarize_error_text] = useState("");
  const [summary_prompt, set_summary_prompt] = useState("");
  const [summary_answer, set_summary_answer] = useState("");
  const [summary_input_token_size_estimated, set_summary_input_token_size_estimated] = useState("");
  const [summary_output_token_size_estimated, set_summary_output_token_size_estimated] = useState("");

  const default_model_map = useMemo(() => {
    return {
      hugging_face: "Qwen/Qwen2.5-7B-Instruct",
      pollination: "polly",
    };
  }, []);


  const cluster_docs = useMemo(() => {
    return Array.isArray(cluster_row?.docs) ? cluster_row?.docs : [];
  }, [cluster_row?.docs]);

  const cluster_title = useMemo(() => {
    return refined_cluster_title || cluster_row?.title || `Cluster ${cluster_index + 1}`;
  }, [refined_cluster_title, cluster_row?.title, cluster_index]);

  const cluster_senders_summary = useMemo(() => {
    const sender_count_map = cluster_docs.reduce((acc_map, doc_row) => {
      const sender_value = is_telegram_dataset
        ? doc_row?.sender_username || doc_row?.entity_name || doc_row?.entity_id || ""
        : doc_row?.sender_signature ||  doc_row?.sender || doc_row?.from || doc_row?.from_email || "";
      const sender_key = String(sender_value || "").trim();

      if (!has_value(sender_key)) {
        return acc_map;
      }

      const current_count = acc_map[sender_key] || 0;
      acc_map[sender_key] = current_count + 1;
      return acc_map;
    }, {});

    
    const sender_rows = Object.entries(sender_count_map)
      .map(([sender_name, sender_count]) => ({
        sender_name,
        sender_count,
      }))
      .sort((row_a, row_b) => {
        const count_delta = Number(row_b?.sender_count || 0) - Number(row_a?.sender_count || 0);
        if (count_delta !== 0) {
          return count_delta;
        }

        return String(row_a?.sender_name || "").localeCompare(String(row_b?.sender_name || ""));
      });

    if (sender_rows.length === 0) {
      return "";
    }

    return sender_rows
      .map(
        (sender_row) =>
          `${sender_row.sender_name} (${sender_row.sender_count} ${sender_row.sender_count === 1 ? "message" : "messages"})`,
      )
      .join(" | ");
  }, [cluster_docs, is_telegram_dataset]);

  const hf_token = useMemo(() => {
    return api_tokens.find((token_row) => token_row?.db_key === "hf_user");
  }, []);

  const pollination_token = useMemo(() => {
    return api_tokens.find((token_row) => token_row?.db_key === "pollination_user");
  }, []);

  const open_ai_popup = useCallback(() => {
    set_is_ai_popup_visible(true);
  }, []);

  const close_ai_popup = useCallback(() => {
    set_is_ai_popup_visible(false);
  }, []);

  const doc_ids = useMemo(() => {
    const doc_id_attribute = is_telegram_dataset ? "message_id" : "email_id";
    return cluster_docs
      .map((doc_row) => doc_row?.[doc_id_attribute])
      .filter((doc_id) => has_value(doc_id));
  }, [cluster_docs, is_telegram_dataset]);

  const cluster_identity_signature = useMemo(() => {
    return `${String(cluster_row?.title || "")}::${doc_ids.join(",")}`;
  }, [cluster_row?.title, doc_ids]);

  useEffect(() => {
    set_refined_cluster_title("");
  }, [cluster_identity_signature]);

  const build_model_options = useCallback((provider_id, models_res) => {
    if (provider_id === "hugging_face") {
      return (Array.isArray(models_res) ? models_res : []).map((row_data) => {
        const model_id = row_data?.id || "";
        const downloads_number = Number(row_data?.downloads);
        const downloads_label = Number.isFinite(downloads_number)
          ? downloads_number.toLocaleString()
          : "0";

        return {
          id: model_id,
          label: model_id,
          description: `⬇ ${downloads_label}`,
          is_available: has_value(model_id),
        };
      });
    }

    return (Array.isArray(models_res) ? models_res : []).map((row_data) => {
      const model_id = row_data?.name || "";
      const pricing_label = has_value(row_data?.pricing)
        ? `Pricing: ${row_data.pricing}`
        : "";

      return {
        id: model_id,
        label: model_id,
        description: pricing_label,
        is_available: has_value(model_id),
      };
    });
  }, []);

  const load_models_for_provider = useCallback(async (provider_id, preferred_model = "") => {
    set_is_models_loading(true);
    set_refine_error_text("");
    set_summarize_error_text("");

    try {
      const models_res =
        provider_id === "hugging_face"
          ? await get_hf_text_models()
          : await get_pollination_text_models();

      const next_options = build_model_options(provider_id, models_res).filter(
        (model_option) => has_value(model_option?.id),
      );

      const default_model = default_model_map?.[provider_id] || "";
      const has_default_model = next_options.some(
        (model_option) => String(model_option?.id) === String(default_model),
      );
      const has_preferred_model = next_options.some(
        (model_option) => String(model_option?.id) === String(preferred_model),
      );
      const fallback_model = next_options?.[0]?.id || "";
      const resolved_model = has_preferred_model
        ? preferred_model
        : has_default_model
          ? default_model
          : fallback_model;

      set_model_options(next_options);
      set_selected_model(resolved_model);

      console.log("[ClusterCard] models loaded", {
        cluster_index,
        provider_id,
        models_count: next_options.length,
        selected_model: resolved_model,
      });

      return {
        selected_model: resolved_model,
        model_options: next_options,
      };
    } catch (error) {
      set_model_options([]);
      set_selected_model("");
      const load_models_error_text = "Unable to load models for selected provider.";
      set_refine_error_text(load_models_error_text);
      set_summarize_error_text(load_models_error_text);
      console.log("[ClusterCard] models loading failed", {
        cluster_index,
        provider_id,
        error,
      });

      return {
        selected_model: "",
        model_options: [],
      };
    } finally {
      set_is_models_loading(false);
    }
  }, [build_model_options, cluster_index, default_model_map]);

  const sync_saved_keys = useCallback(async () => {
    set_saved_keys_loading(true);

    try {
      const saved_keys_res = await get_saved_keys();
      const hf_available =
        saved_keys_res?.hf_user !== null && saved_keys_res?.hf_user !== undefined;
      const pollination_available =
        saved_keys_res?.pollination_user !== null &&
        saved_keys_res?.pollination_user !== undefined;

      set_hf_key_available(Boolean(hf_available));
      set_pollination_key_available(Boolean(pollination_available));

      const next_provider_options = [
        {
          id: "pollination",
          label: "Pollination",
          description: "Use your Pollination key",
          is_available: Boolean(pollination_available),
        },
        {
          id: "hugging_face",
          label: "Hugging Face",
          description: "Use your Hugging Face key",
          is_available: Boolean(hf_available),
        },
      ];

      const first_available_provider = next_provider_options.find(
        (provider_row) => provider_row?.is_available,
      );

      const available_provider_ids = next_provider_options
        .filter((provider_row) => provider_row?.is_available)
        .map((provider_row) => provider_row?.id);
      const can_keep_selected_provider = available_provider_ids.includes(selected_provider);
      const resolved_provider = can_keep_selected_provider
        ? selected_provider
        : first_available_provider?.id || "";

      set_provider_options(next_provider_options);
      set_selected_provider(resolved_provider);

      console.log("[ClusterCard] saved keys loaded", {
        cluster_index,
        hf_available,
        pollination_available,
        selected_provider: resolved_provider,
      });

      if (resolved_provider) {
        const load_res = await load_models_for_provider(
          resolved_provider,
          resolved_provider === selected_provider ? selected_model : "",
        );

        return {
          has_available_provider: true,
          provider_id: resolved_provider,
          model_id: load_res?.selected_model || "",
        };
      } else {
        set_model_options([]);
        set_selected_model("");
        const missing_key_error_text =
          "You should set a valid key for Hugging Face or Pollination.";
        set_refine_error_text(missing_key_error_text);
        set_summarize_error_text(missing_key_error_text);

        return {
          has_available_provider: false,
          provider_id: "",
          model_id: "",
        };
      }
    } catch (error) {
      set_provider_options([
        {
          id: "hugging_face",
          label: "Hugging Face",
          description: "Use your Hugging Face key",
          is_available: false,
        },
        {
          id: "pollination",
          label: "Pollination",
          description: "Use your Pollination key",
          is_available: false,
        },
      ]);
      const keys_error_text = "Unable to check provider keys right now.";
      set_refine_error_text(keys_error_text);
      set_summarize_error_text(keys_error_text);
      console.log("[ClusterCard] saved keys loading failed", {
        cluster_index,
        error,
      });

      return {
        has_available_provider: false,
        provider_id: "",
        model_id: "",
      };
    } finally {
      set_saved_keys_loading(false);
    }
  }, [
    cluster_index,
    load_models_for_provider,
    selected_model,
    selected_provider,
  ]);

  const show_save_key_popup = useCallback((set_route, key_title) => {
    set_key_to_insert_obj({ route: set_route, key_title });
  }, []);

  const on_confirm_save = useCallback(async (set_route, key_val) => {
    try {
      const public_key = await get_rsa_public_key();
      const encrypted = await encryptWithPublicKey(key_val, public_key);
      const saving_res = await save_encrypted_key(set_route, encrypted);

      if (saving_res && saving_res.success) {
        toast.success("Your key is saved");
        await sync_saved_keys();
        return;
      }

      if (saving_res && !saving_res.success) {
        toast.error("Your key is invalid !");
        throw new Error("Your key is invalid");
      }

      throw new Error("There was an error trying to save the key");
    } catch (ex) {
      console.error("[ClusterCard] error trying to encrypt/save key", ex);
      throw new Error(ex?.message || "There was an error trying to save the key");
    }
  }, [sync_saved_keys]);

  const handle_provider_change = useCallback(async (provider_id) => {
    set_selected_provider(provider_id);
    set_generated_prompt("");
    set_generated_title("");
    set_summarize_error_text("");
    set_summary_answer("");
    await load_models_for_provider(provider_id);
  }, [load_models_for_provider]);

  const handle_model_change = useCallback((model_id) => {
    set_selected_model(model_id);
    set_generated_prompt("");
    set_generated_title("");
    set_summarize_error_text("");
    set_summary_answer("");
  }, []);

  const request_refine = useCallback(async (provider_id, model_id) => {
    set_is_refine_loading(true);
    set_refine_error_text("");

    try {
      const refine_res = await get_cluster_prompt(
        dataset_id,
        doc_ids,
        provider_id,
        model_id,
      );


      set_generated_prompt(String(refine_res?.prompt || ""));
      const next_generated_title = String(
        refine_res?.generated_title || refine_res?.title || "",
      );
      set_generated_title(next_generated_title);
      if (has_value(next_generated_title)) {
        set_refined_cluster_title(next_generated_title);
      }

    } catch (error) {
      set_refine_error_text("Unable to generate refine prompt for this cluster.");
      console.log("[ClusterCard] refine request failed", {
        cluster_index,
        provider_id,
        model_id,
        error,
      });
    } finally {
      set_is_refine_loading(false);
    }
  }, [cluster_index, dataset_id, doc_ids]);

  const handle_refine_title = useCallback(async () => {
    console.log("[ClusterCard] refine clicked", {
      cluster_index,
      cluster_title,
      docs_ids: doc_ids,
      selected_provider,
      selected_model,
    });

    if (!is_refine_panel_visible) {
      set_is_refine_panel_visible(true);
      set_is_refine_bootstrap_loading(true);
      set_refine_error_text("");
      set_generated_prompt("");
      set_generated_title("");

      try {
        const sync_res = await sync_saved_keys();

        if (!sync_res?.has_available_provider) {
          return;
        }

        if (!has_value(sync_res?.provider_id) || !has_value(sync_res?.model_id)) {
          set_refine_error_text("Please choose a model.");
          return;
        }

        if (!has_value(dataset_id) || doc_ids.length === 0) {
          set_refine_error_text("Missing dataset or message ids for this cluster.");
          return;
        }

        await request_refine(sync_res.provider_id, sync_res.model_id);
      } catch (error) {
        set_refine_error_text("Unable to check provider keys right now.");
        console.log("[ClusterCard] saved keys loading failed", {
          cluster_index,
          error,
        });
      } finally {
        set_is_refine_bootstrap_loading(false);
      }

      return;
    }

    if (!has_value(selected_provider)) {
      set_refine_error_text(
        "You should set a valid key for Hugging Face or Pollination to use refine.",
      );
      return;
    }

    if (!has_value(selected_model)) {
      set_refine_error_text("Please choose a model.");
      return;
    }

    if (!has_value(dataset_id) || doc_ids.length === 0) {
      set_refine_error_text("Missing dataset or message ids for this cluster.");
      return;
    }

    await request_refine(selected_provider, selected_model);
  }, [
    cluster_index,
    cluster_title,
    dataset_id,
    doc_ids,
    is_refine_panel_visible,
    request_refine,
    selected_model,
    selected_provider,
    sync_saved_keys,
  ]);

  const handle_summarize_cluster = useCallback(() => {
    console.log("[ClusterCard] summarize cluster clicked", {
      cluster_index,
      cluster_title,
      docs_count: cluster_docs.length,
    });

    if (is_summarize_panel_visible) {
      return;
    }

    const bootstrap_summarize_panel = async () => {
      set_is_summarize_panel_visible(true);
      set_is_summarize_bootstrap_loading(true);
      set_is_summarize_prompt_loading(false);
      set_is_summarize_loading(false);
      set_summarize_error_text("");
      set_summary_prompt("");
      set_summary_answer("");
      set_summary_input_token_size_estimated("");
      set_summary_output_token_size_estimated("");

      try {
        const sync_res = await sync_saved_keys();

        if (!sync_res?.has_available_provider) {
          return;
        }

        if (!has_value(sync_res?.provider_id) || !has_value(sync_res?.model_id)) {
          set_summarize_error_text("Please choose a model.");
          return;
        }

        if (!has_value(dataset_id) || doc_ids.length === 0) {
          set_summarize_error_text("Missing dataset or message ids for this cluster.");
          return;
        }

        set_is_summarize_prompt_loading(true);
        const summarize_prompt_res = await get_group_messages_summarize_prompt(dataset_id, doc_ids);

        set_summary_prompt(String(summarize_prompt_res?.prompt || ""));
        set_summary_input_token_size_estimated(
          String(summarize_prompt_res?.input_token_size_estimated ?? ""),
        );
        set_summary_output_token_size_estimated(
          String(summarize_prompt_res?.output_token_size_estimated ?? ""),
        );
      } catch (error) {
        set_summarize_error_text("Unable to generate summarize prompt for this cluster.");
        console.log("[ClusterCard] summarize prompt failed", {
          cluster_index,
          error,
        });
      } finally {
        set_is_summarize_prompt_loading(false);
        set_is_summarize_bootstrap_loading(false);
      }
    };

    bootstrap_summarize_panel();
  }, [
    cluster_docs.length,
    cluster_index,
    cluster_title,
    dataset_id,
    doc_ids,
    is_summarize_panel_visible,
    sync_saved_keys,
  ]);

  const run_summary_prompt = useCallback(async () => {
    if (!has_value(selected_provider)) {
      set_summarize_error_text(
        "You should set a valid key for Hugging Face or Pollination to use summarize.",
      );
      return;
    }

    if (!has_value(selected_model)) {
      set_summarize_error_text("Please choose a model.");
      return;
    }

    if (!has_value(dataset_id) || doc_ids.length === 0) {
      set_summarize_error_text("Missing dataset or message ids for this cluster.");
      return;
    }

    if (!has_value(summary_prompt)) {
      set_summarize_error_text("No summarize prompt found for this cluster.");
      return;
    }

    set_is_summarize_loading(true);
    set_summarize_error_text("");
    set_summary_answer("");

    try {
      const summarize_res = await get_group_messages_summary(
        dataset_id,
        doc_ids,
        selected_model,
        selected_provider,
      );

      if (typeof summarize_res === "string") {
        throw new Error(summarize_res || "Unable to summarize this cluster right now.");
      }

      const next_summary_answer = String(summarize_res?.answer || "").trim();
      if (!has_value(next_summary_answer)) {
        throw new Error("Unable to summarize this cluster right now.");
      }

      set_summary_answer(next_summary_answer);
      console.log("[ClusterCard] summarize answer loaded", {
        cluster_index,
        provider_id: selected_provider,
        model_id: selected_model,
      });
    } catch (error) {
      set_summarize_error_text(
        String(error?.message || "Unable to summarize this cluster right now."),
      );
      console.log("[ClusterCard] summarize answer failed", {
        cluster_index,
        provider_id: selected_provider,
        model_id: selected_model,
        error,
      });
    } finally {
      set_is_summarize_loading(false);
    }
  }, [
    cluster_index,
    dataset_id,
    doc_ids,
    selected_model,
    selected_provider,
    summary_prompt,
  ]);

  return (
    <div
      key={`${key_prefix}-${cluster_index}`}
      className={`${styles.cluster_card}${card_class_name ? ` ${card_class_name}` : ""}`}
    >
      <div className={styles.cluster_title}>
        <div className={styles.cluster_number}>{cluster_index + 1}</div>
        <div className={styles.cluster_title_content}>
          <div className={styles.cluster_title_text}>{cluster_title}</div>
          <div className={styles.cluster_subtitle}>
            {cluster_docs.length} {cluster_docs.length === 1 ? "message" : "messages"}
          </div>
          {has_value(cluster_senders_summary) && (
            <div className={styles.cluster_subtitle}>Senders: {cluster_senders_summary}</div>
          )}
        </div>

        <Button
          onClick={open_ai_popup}
          size="small"
          variant="secondary"
          btnClass={styles.ai_btn}
        >
          <FaMagic /> AI
        </Button>
      </div>

      <div className={styles.docs_grid}>
        {cluster_docs.map((doc_row, doc_index) => {
          const message_preview = build_message_preview(
            doc_row,
            Boolean(is_telegram_dataset),
          );

          return (
            <div
              key={`doc-${key_prefix}-${cluster_index}-${doc_index}`}
              className={styles.doc_card}
            >
              <div className={styles.doc_title}>{message_preview.title}</div>
              {has_value(message_preview.subtitle) && (
                <div className={styles.doc_subtitle}>{message_preview.subtitle}</div>
              )}
              <p className={styles.doc_text}>{message_preview.text}</p>
            </div>
          );
        })}
      </div>

      {!is_loading && !error_text && cluster_docs.length === 0 && (
        <p className={styles.info_text}>No messages in this cluster.</p>
      )}

      <Popup
        title={`AI actions · Cluster ${cluster_index + 1}`}
        isVisible={is_ai_popup_visible}
        closePopup={close_ai_popup}
        popupContainerStyle={{
          width: "70vw",
          maxWidth: "70vw",
        }}
      >
        <div className={styles.ai_popup_cards}>
          <div className={styles.ai_popup_card}>
            <h4 className={styles.ai_popup_card_title}>Current title: {cluster_title}</h4>
            <p className={styles.ai_popup_card_description}>
              This title was generated from the most important tokens of the messages. If
              you want to refine it, click on the button below.
            </p>
              <div className={styles.ai_popup_card_actions}>
                <Button
                  onClick={handle_refine_title}
                  size="small"
                  variant="secondary"
                  disabled={is_refine_loading}
                >
                  {is_refine_loading ? "Refining..." : "Refine"}
                </Button>
              </div>

            {is_refine_panel_visible && (
              <div className={styles.refine_root}>
                {is_refine_bootstrap_loading && (
                  <p className={styles.info_text}>Checking saved provider keys...</p>
                )}

                {!is_refine_bootstrap_loading && (
                  <>
                    {!hf_key_available && !pollination_key_available && (
                      <div className={styles.ai_popup_card_actions}>
                        {!pollination_key_available && (
                          <Button
                            size="small"
                            variant="secondary"
                            onClick={() =>
                              show_save_key_popup(
                                pollination_token?.set_route,
                                pollination_token?.name || "Pollination",
                              )
                            }
                            disabled={saved_keys_loading || !pollination_token?.set_route}
                          >
                            Set pollination key
                          </Button>
                        )}

                        {!hf_key_available && (
                          <Button
                            size="small"
                            variant="secondary"
                            onClick={() =>
                              show_save_key_popup(
                                hf_token?.set_route,
                                hf_token?.name || "Hugging face",
                              )
                            }
                            disabled={saved_keys_loading || !hf_token?.set_route}
                          >
                            Set hugging face key
                          </Button>
                        )}
                      </div>
                    )}

                    <div className={styles.refine_selects_row}>
                      <RichSelect
                        label="Provider"
                        value={selected_provider}
                        options={provider_options}
                        onChange={handle_provider_change}
                        compact={true}
                      />

                      <RichSelect
                        label="Model"
                        value={selected_model}
                        options={model_options}
                        onChange={handle_model_change}
                        disabled={!has_value(selected_provider) || is_models_loading}
                        compact={true}
                      />
                    </div>

                    {is_models_loading && (
                      <p className={styles.info_text}>Loading models...</p>
                    )}

                    {has_value(refine_error_text) && (
                      <p className={styles.validation_text}>{refine_error_text}</p>
                    )}


                    {has_value(generated_prompt) && (
                      <div className={styles.refine_card}>
                        <h4 className={styles.refine_card_title}>Default prompt</h4>
                        <p className={styles.ai_popup_card_description}>
                          This is the default prompt used to generate the refined title.
                        </p>
                        <textarea
                          className={styles.prompt_textarea}
                          value={generated_prompt}
                          readOnly
                          disabled
                        />
                      </div>
                    )}

                    {has_value(generated_title) && (
                      <div className={styles.generated_title_card}>
                        <h4 className={styles.refine_card_title}>Generated title</h4>
                        <div className={styles.generated_title_value}>{generated_title}</div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <div className={styles.ai_popup_card}>
            <h4 className={styles.ai_popup_card_title}>Summarize cluster</h4>
            <p className={styles.ai_popup_card_description}>
              If you want to summarize the {cluster_docs.length} {cluster_docs.length === 1
                ? "message"
                : "messages"}, press on the button below.
            </p>

            {!is_summarize_panel_visible && (
              <div className={styles.ai_popup_card_actions}>
                <Button onClick={handle_summarize_cluster} size="small" variant="secondary">
                  Summarize
                </Button>
              </div>
            )}

            {is_summarize_panel_visible && (
              <div className={styles.refine_root}>
                {(is_summarize_bootstrap_loading || is_summarize_prompt_loading) && (
                  <p className={styles.info_text}>Preparing summarize prompt...</p>
                )}

                {!is_summarize_bootstrap_loading && (
                  <>
                    {!hf_key_available && !pollination_key_available && (
                      <div className={styles.ai_popup_card_actions}>
                        {!pollination_key_available && (
                          <Button
                            size="small"
                            variant="secondary"
                            onClick={() =>
                              show_save_key_popup(
                                pollination_token?.set_route,
                                pollination_token?.name || "Pollination",
                              )
                            }
                            disabled={saved_keys_loading || !pollination_token?.set_route}
                          >
                            Set pollination key
                          </Button>
                        )}

                        {!hf_key_available && (
                          <Button
                            size="small"
                            variant="secondary"
                            onClick={() =>
                              show_save_key_popup(
                                hf_token?.set_route,
                                hf_token?.name || "Hugging face",
                              )
                            }
                            disabled={saved_keys_loading || !hf_token?.set_route}
                          >
                            Set hugging face key
                          </Button>
                        )}
                      </div>
                    )}

                    <div className={styles.refine_selects_row}>
                      <RichSelect
                        label="Provider"
                        value={selected_provider}
                        options={provider_options}
                        onChange={handle_provider_change}
                        compact={true}
                      />

                      <RichSelect
                        label="Model"
                        value={selected_model}
                        options={model_options}
                        onChange={handle_model_change}
                        disabled={!has_value(selected_provider) || is_models_loading}
                        compact={true}
                      />
                    </div>

                    {is_models_loading && (
                      <p className={styles.info_text}>Loading models...</p>
                    )}

                    {has_value(summarize_error_text) && (
                      <p className={styles.validation_text}>{summarize_error_text}</p>
                    )}

                    {has_value(summary_prompt) && (
                      <div className={styles.refine_card}>
                        <h4 className={styles.refine_card_title}>Default prompt</h4>
                        <p className={styles.ai_popup_card_description}>
                          input tokens: {summary_input_token_size_estimated || "-"} | output
                          tokens: {summary_output_token_size_estimated || "-"}
                        </p>
                        <textarea
                          className={styles.prompt_textarea}
                          value={summary_prompt}
                          readOnly
                          disabled
                        />
                      </div>
                    )}

                    {has_value(summary_prompt) && (
                      <div className={styles.warning_box}>
                        <p className={styles.warning_text}>do you want to run the prompt ?</p>
                        <div className={styles.ai_popup_card_actions}>
                          <Button
                            onClick={run_summary_prompt}
                            size="small"
                            variant="secondary"
                            disabled={is_summarize_loading || is_summarize_prompt_loading}
                          >
                            {is_summarize_loading ? "Summarizing..." : "Summarize"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {is_summarize_loading && (
                      <p className={styles.info_text}>Generating summary answer...</p>
                    )}

                    {has_value(summary_answer) && (
                      <div className={styles.generated_title_card}>
                        <h4 className={styles.refine_card_title}>Summary answer</h4>
                        <p className={styles.summary_answer_text}>{summary_answer}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </Popup>

      <SetKeyPopup
        key_to_insert_obj={key_to_insert_obj}
        set_key_to_insert_obj={set_key_to_insert_obj}
        on_confirm_save={on_confirm_save}
      />
    </div>
  );
}