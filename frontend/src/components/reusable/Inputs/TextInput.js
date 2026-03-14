import React from "react";
import "./Inputs.scss";

const TextInput = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  width,
  cls_root,
  styles,
  required,
  onBlur,
  name,
  suggestions,
}) => {
  const visible_suggestions = Array.isArray(suggestions) ? suggestions : [];

  return (
    <div
      className={`input-wrapper ${cls_root} ${error ? "error" : ""}`}
      style={{ width, ...styles }}
    >
      {label && (
        <label className="input-label">
          {label} {required && <span className="required-star">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || ""}
        className="input-field"
        onBlur={onBlur}
      />

      {visible_suggestions.length > 0 && (
        <div className="input-suggestions">
          {visible_suggestions.map((suggestion_item) => (
            <button
              type="button"
              key={suggestion_item}
              className="suggestion-item"
              onClick={() => onChange(suggestion_item)}
            >
              {suggestion_item}
            </button>
          ))}
        </div>
      )}

      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export default TextInput;
