import React from "react";
import "./Popup.scss";
import Popup from "./Popup";
import Button from "../Button/Button";

export default function ConfirmPopup({
  title = "Asking confirmation",
  message = "Are you sure you want to ?",
  yes_label = "Yes",
  no_label = "No",
  yes_function,
  close_function,
  yes_loading = false,
}) {
  // This would be always visible, you can control to show it or not in the parent.

  return (
    <>
      <Popup title={title} isVisible={true} closePopup={close_function}>
        <p> {message}</p>
        <div className="d-flex">
          <Button onClick={yes_function} loading={yes_loading} disabled={yes_loading}>
            {yes_label}
          </Button>
          <Button variant="thirdy" onClick={close_function}>
            {" "}
            {no_label}
          </Button>
        </div>
      </Popup>
    </>
  );
}
