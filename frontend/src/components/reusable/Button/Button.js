import React from "react";

const Button = ({
  children,
  onClick,
  loading,
  btnClass,
  width,
  style,
  variant = "primary",
  size = "normal", // might be small
  disabled = false,
  type = "button",
  fullWidth = false,
}) => {
  return (
    <button
      className={`btn ${btnClass} ${variant} ${size} ${fullWidth ? "full-width" : ""}`}
      style={{ width: width ? width : "auto", cursor: (disabled || loading) ? "not-allowed" : "pointer", ...style }}
      onClick={loading && !disabled ? () => {} : () => onClick()}
      disabled={loading || disabled }
      type={type}
    >
      {loading && <span className="spinner"> </span>}
      {children}
    </button>
  );
};

export default Button;
