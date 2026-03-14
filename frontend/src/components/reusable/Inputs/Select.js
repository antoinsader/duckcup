// SelectInput.jsx
import React from "react";
import "./Inputs.scss";

const SelectInput = ({ label, value, onChange, options = [], error , width, cls_root, cls_field

  ,required,
  onBlur

}) => {
  return (
    <div className={`input-wrapper ${cls_root} ${error ? "error" : ""}`} style={{width}}>
      {label && <label className="input-label">{label}  {required && <span className="required-star">*</span>}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input-field ${cls_field}`}
        onBlur={onBlur}

      >
        <option value="">All </option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export default SelectInput;
