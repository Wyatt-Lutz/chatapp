import React from "react";

const VARIANT_CLASSES = {
  primary: "bg-accent text-white hover:opacity-90",
  secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
  ghost: "bg-transparent text-slate-100 hover:bg-slate-700",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const SIZE_CLASSES = {
  sm: "px-2 py-1 text-sm",
  md: "px-3 py-2 text-sm",
  lg: "px-4 py-2 text-base",
};

const Button = ({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) => {
  const variantClass = VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary;
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-md ${sizeClass} ${variantClass} disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
