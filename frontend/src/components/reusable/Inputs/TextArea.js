import React from "react";
import "./Inputs.scss";

const TextArea = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  rows = 3,
  width,
  required,
  onBlur
}) => {
  return (
    <div className={`input-wrapper ${error ? "error" : ""}`} style={{ width }}>
      {label && <label className="input-label">{label}  {required && <span className="required-star">*</span>}</label>}
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || ""}
        className="input-field"
        onBlur={onBlur}

      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export default TextArea;
