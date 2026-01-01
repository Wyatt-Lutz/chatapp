import React from "react";

const Input = ({ label, id, error, helper, className = "", ...props }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm text-slate-700 dark:text-slate-200 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        {...props}
        className={`rounded-md border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary ${error ? "border-red-500" : ""}`}
        aria-invalid={error ? "true" : "false"}
      />
      {helper && <div className="text-xs text-slate-500 mt-1">{helper}</div>}
      {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
    </div>
  );
};

export default Input;
