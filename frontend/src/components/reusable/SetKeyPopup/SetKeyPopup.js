import { useState } from "react";

import Button from "../Button/Button";
import TextInput from "../Inputs/TextInput";
import Popup from "../Popup/Popup";

export default function SetKeyPopup({
  key_to_insert_obj,
  set_key_to_insert_obj,
  on_confirm_save,
}) {
  const [key_val, set_key_val] = useState("");
  const [insrt_key_loading, set_insert_key_loading] = useState(false);
  const [insrt_key_error, set_insert_key_error] = useState(false);

  const save_key = async () => {
    if (!key_val) return;
    set_insert_key_loading(true);
    set_insert_key_error();
    try {
      await on_confirm_save(key_to_insert_obj.route, key_val);
      set_key_to_insert_obj(null);
      set_key_val("");
    } catch (error_obj) {
      set_insert_key_error(
        error_obj?.message || "There was an error trying to save the key",
      );
    } finally {
      set_insert_key_loading(false);
    }
  };

  return key_to_insert_obj ? (
    <Popup
      title={`Insert ${key_to_insert_obj.key_title} key: `}
      isVisible={key_to_insert_obj}
      closePopup={() => {
        set_key_to_insert_obj(null);
        set_key_val("");
        set_insert_key_error(false);
      }}
    >
      <div>
        <p className="warning_note">
          Don't worry we make sure to send the key encrypted through the request
          for privacy
        </p>
        <TextInput
          label="Key value"
          value={key_val}
          onChange={set_key_val}
          placeholder={"Insert your key here"}
          required={true}
          styles={{ margin: "2.75rem 0" }}
        />
        {insrt_key_error && <p className="error_note"> {insrt_key_error}</p>}
        {insrt_key_loading ? (
          <>
            <span className="spinner"></span> <span> Saving..</span>{" "}
          </>
        ) : (
          <Button onClick={save_key} disabled={key_val === ""}>
            Save key
          </Button>
        )}
      </div>
    </Popup>
  ) : (
    ""
  );
}
