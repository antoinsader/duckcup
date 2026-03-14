import React from "react";
import "./Popup.scss";

export default function Popup({
  title = "",
  isVisible = false,
  closePopup,
  content,
  component: Component,
  componentProps = {},
  popupContainerStyle = {},
  footer,
  children,
}) {
  if (!isVisible) return null;

  return (
    <div className="popup-overlay" onClick={closePopup}>
      <div
        className="popup-content"
        style={popupContainerStyle}
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <div className="popup_header">
          <h3 className="popup_title">{title}</h3>
          {closePopup ? (
            <button className="close-btn" onClick={closePopup}>
              ✕
            </button>
          ) : (
            ""
          )}
        </div>

        <div className="popup_body_root">
          <div className="popup_container">
            {children ? (
              children
            ) : Component ? (
              <Component {...componentProps} closePopup={closePopup} />
            ) : (
              <>{content}</>
            )}
          </div>

          {footer ? <div className="popup_footer">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
