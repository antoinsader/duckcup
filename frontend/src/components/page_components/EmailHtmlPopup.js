import { useCallback, useEffect, useRef, useState } from "react";

import { get_account_email_html } from "../../lib/backend/emails";
import { get_dataste_email_html } from "../../lib/backend/dataset";

import Popup from "../reusable/Popup/Popup";
import Toggle from "../reusable/Toggle/Toggle";

import styles from "./EmailHtmlPopup.module.scss";

const interactive_elements_selector =
  'a, button, input[type="button"], input[type="submit"], input[type="reset"]';
const removed_interactive_attr = "data-removed-interactive";
const removed_interactive_original_html_attr = "data-removed-original-html";

export default function EmailHtmlPopup({
  is_visible = false,
  close_popup,
  account_id,
  dataset_id , 
  email_id,
}) {
  const [email_html, set_email_html] = useState("");
  const [is_loading, set_is_loading] = useState(false);
  const [error_message, set_error_message] = useState("");
  const [activate_btns, set_activate_btns] = useState(false);

  const html_root_ref = useRef(null);

  useEffect(() => {
    const has_valid_account_id = account_id !== undefined && account_id !== null;
    const has_valid_dataset_id = dataset_id !== undefined && dataset_id !== null;
    const has_valid_email_id = email_id !== undefined && email_id !== null;

    if (!is_visible) return;

    if ((!has_valid_account_id && !has_valid_dataset_id) || !has_valid_email_id) {
      console.log("[EmailHtmlPopup] popup opened with missing identifiers", {
        account_id,
        email_id,
      });
      set_error_message("Missing email identifiers to load HTML.");
      set_email_html("");
      return;
    }

    const fetch_email_html = async () => {
      console.log("[EmailHtmlPopup] loading email html", {
        account_id,
        email_id,
      });

      set_is_loading(true);
      set_error_message("");
      set_activate_btns(false);
      set_email_html("");
      let response;

      if (has_valid_dataset_id) {
        response = await get_dataste_email_html(dataset_id, email_id);
      } else {
        response = await get_account_email_html(account_id, email_id);
      }
      if (typeof response === "string") {
        set_email_html(response);
      } else {
        set_email_html("");
        set_error_message("Email HTML content is empty or invalid.");
      }

      set_is_loading(false);
    };

    fetch_email_html();
  }, [account_id, dataset_id, email_id, is_visible]);

  useEffect(() => {
    const html_root = html_root_ref.current;
    if (!html_root) return;

    if (activate_btns) {
      const removed_interactive_nodes = html_root.querySelectorAll(
        `[${removed_interactive_attr}="true"]`
      );

      removed_interactive_nodes.forEach((placeholder_node) => {
        const original_html = placeholder_node.getAttribute(
          removed_interactive_original_html_attr
        );

        if (!original_html) {
          placeholder_node.remove();
          return;
        }

        const restore_container = document.createElement("div");
        restore_container.innerHTML = original_html;
        const restored_node = restore_container.firstElementChild;

        if (restored_node) {
          placeholder_node.replaceWith(restored_node);
          return;
        }

        placeholder_node.remove();
      });

      return;
    }

    const interactive_nodes = html_root.querySelectorAll(interactive_elements_selector);

    interactive_nodes.forEach((interactive_node) => {
      const placeholder_node = document.createElement("span");
      placeholder_node.className = styles.removed_interactive_placeholder;
      placeholder_node.setAttribute(removed_interactive_attr, "true");
      placeholder_node.setAttribute(
        removed_interactive_original_html_attr,
        interactive_node.outerHTML
      );

      const placeholder_text = (interactive_node.textContent || "").trim();
      placeholder_node.textContent = placeholder_text || "[interactive element removed]";

      interactive_node.replaceWith(placeholder_node);
    });
  }, [activate_btns, email_html]);

  const handle_html_click_capture = useCallback(
    (event) => {
      if (activate_btns) return;

      const click_target = event.target;
      const clicked_button = click_target?.closest?.(
        interactive_elements_selector
      );

      if (clicked_button) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    [activate_btns]
  );

  return (
    <Popup
      title="Email HTML"
      isVisible={is_visible}
      closePopup={close_popup}
      popupContainerStyle={{ width: "min(1100px, 96%)", maxWidth: "96vw", maxHeight: "90vh" }}
    >
      <div className={styles.html_popup_root}>
        <div className="warning_note">
          This email contains original HTML. Buttons inside it may behave like the
          original email. Please do not press any button if you do not trust the sender.
        </div>

        <div className={styles.toggle_row}>
          <Toggle
            id="activate_email_buttons"
            checked={activate_btns}
            on_change={set_activate_btns}
            label="Activate buttons inside email HTML"
          />
        </div>

        {is_loading ? (
          <div className={styles.loading_root}>
            <div className="spinner" />
          </div>
        ) : error_message ? (
          <div className="error_note">{error_message}</div>
        ) : (
          <div
            className={styles.html_content_root}
            ref={html_root_ref}
            onClickCapture={handle_html_click_capture}
            dangerouslySetInnerHTML={{ __html: email_html }}
          />
        )}
      </div>
    </Popup>
  );
}
