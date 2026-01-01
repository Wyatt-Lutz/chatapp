import React from "react";

const Card = ({ title, description, children, className = "", actions }) => {
  return (
    <div
      className={`bg-surface dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg shadow-card p-4 ${className}`}
    >
      {(title || description) && (
        <div className="mb-3">
          {title && (
            <div className="font-semibold text-slate-900 dark:text-white">
              {title}
            </div>
          )}
          {description && (
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {description}
            </div>
          )}
        </div>
      )}
      <div>{children}</div>
      {actions && <div className="mt-4 flex justify-end gap-2">{actions}</div>}
    </div>
  );
};

export default Card;
