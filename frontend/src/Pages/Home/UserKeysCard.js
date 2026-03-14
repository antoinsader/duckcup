import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaExternalLinkAlt, FaTrash } from "react-icons/fa";

import Button from "../../components/reusable/Button/Button";
import Popup from "../../components/reusable/Popup/Popup";
import SetKeyPopup from "../../components/reusable/SetKeyPopup/SetKeyPopup";

import { encryptWithPublicKey } from "../../lib/encryption/encrypt";
import { api_tokens } from "../../lib/config/api_tokens";
import {
  delete_saved_key,
  get_rsa_public_key,
  get_saved_keys,
  save_encrypted_key,
} from "../../lib/backend/keys";

import styles from "./Home.module.scss";

const build_keys_objs = (saved_keys) => {
  const _keys_objs = {};
  api_tokens.forEach((api_token) => {
    _keys_objs[api_token.db_key] = saved_keys?.[api_token.db_key] || null;
  });
  return _keys_objs;
};

function KeyContent({
  name,
  key_obj,
  attrs,
  set_route,
  delete_route,
  website,
  valid_keys_loading,
  on_click_delete,
  on_click_set,
}) {
  return (
    <div className={styles.keyContentCard}>
      <h3> {name}</h3>
      {valid_keys_loading ? (
        <span className="spinner"></span>
      ) : key_obj ? (
        <>
          <span className={`${styles.status_badge} ${styles.active}`}>
            Valid
          </span>
          <span
            className={styles.deleteContainer}
            onClick={(e) => on_click_delete(e, delete_route, name)}
          >
            <FaTrash />
          </span>
          {attrs.map((attr) => (
            <p key={attr.key}>
              <b> {attr.label}</b> {key_obj[attr.key]}
            </p>
          ))}
        </>
      ) : (
        <>
          <span className={`${styles.status_badge} `}>Not valid or not set </span>
          <Button onClick={() => on_click_set(set_route, name)}>Set token </Button>
        </>
      )}
      <div>
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="externalButton"
        >
          <FaExternalLinkAlt /> Open Website
        </a>
      </div>
      <div className="code_divider" />
    </div>
  );
}

function DeleteKeyPopup({ key_to_delete, set_key_to_delete, on_confirm_delete }) {
  const [delete_key_loading, set_delete_key_loading] = useState(false);

  const delete_key = async () => {
    set_delete_key_loading(true);
    try {
      await on_confirm_delete(key_to_delete.delete_route);
    } finally {
      set_delete_key_loading(false);
    }
  };

  return key_to_delete ? (
    <Popup
      title={`Delete ${key_to_delete.name} key: `}
      isVisible={key_to_delete}
      closePopup={() => set_key_to_delete(null)}
    >
      <div>
        <p className="warning_note">
          Are you sure you want to delete the key of {key_to_delete.name}
        </p>
        {delete_key_loading ? (
          <>
            <span className="spinner"></span> <span> Deleting..</span>{" "}
          </>
        ) : (
          <div className="d-flex">
            <Button onClick={delete_key}>Yes, I want to delete the key</Button>
            <Button onClick={() => set_key_to_delete(null)}>No, keep my key</Button>
          </div>
        )}
      </div>
    </Popup>
  ) : (
    ""
  );
}

export default function UserKeysCard() {
  const [valid_keys_loading, set_valid_keys_loading] = useState(false);

  const [key_to_insert_obj, set_key_to_insert_obj] = useState();
  const [key_to_delete, set_key_to_delete] = useState();

  const [keys_objs, set_keys_objs] = useState({});

  const get_keys_validation = async () => {
    set_valid_keys_loading(true);
    try {
      const saved_keys = await get_saved_keys();
      set_keys_objs(build_keys_objs(saved_keys));
    } finally {
      set_valid_keys_loading(false);
    }
  };

  useEffect(() => {
    get_keys_validation();
  }, []);

  const show_save_key_popup = (route, key_title) => {
    set_key_to_insert_obj({ route, key_title });
  };

  const confirm_delete_key = (e, delete_route, name) => {
    e.preventDefault();
    set_key_to_delete({ delete_route, name });
  };

  const on_confirm_delete = async (delete_route) => {
    const delete_res = await delete_saved_key(delete_route);
    if (delete_res && delete_res.success) {
      toast.success("Your key is deleted");
      set_key_to_delete(null);
      get_keys_validation();
      return;
    }
    toast.error("Error deleting the key!");
  };

  const on_confirm_save = async (set_route, key_val) => {
    try {
      const public_key = await get_rsa_public_key();
      const encrypted = await encryptWithPublicKey(key_val, public_key);
      const saving_res = await save_encrypted_key(set_route, encrypted);
      if (saving_res && saving_res.success) {
        toast.success("Your key is saved");
        get_keys_validation();
        return;
      }
      if (saving_res && !saving_res.success) {
        toast.error("Your key is invalid !");
        throw new Error("Your key is invalid");
      }
      throw new Error("There was an error trying to save the key");
    } catch (ex) {
      console.error("error trying to encrypt/save key: ", ex);
      throw new Error(ex?.message || "There was an error trying to save the key");
    }
  };

  return (
    <>
      <h1> User keys info: </h1>
      <p className="subtitle">
        Here, you can setup your API keys to use AI services like summarizing
        the emails.
      </p>
      <div className="code_divider" />
      <div className={styles.keys_container}>
        {api_tokens.map((api_token) => (
          <KeyContent
            key={api_token.db_key}
            name={api_token.name}
            set_route={api_token.set_route}
            delete_route={api_token.delet_route}
            key_obj={keys_objs[api_token.db_key]}
            attrs={api_token.attrs}
            website={api_token.website}
            valid_keys_loading={valid_keys_loading}
            on_click_delete={confirm_delete_key}
            on_click_set={show_save_key_popup}
          />
        ))}
      </div>
      <SetKeyPopup
        key_to_insert_obj={key_to_insert_obj}
        set_key_to_insert_obj={set_key_to_insert_obj}
        on_confirm_save={on_confirm_save}
      />
      <DeleteKeyPopup
        key_to_delete={key_to_delete}
        set_key_to_delete={set_key_to_delete}
        on_confirm_delete={on_confirm_delete}
      />
    </>
  );
}
