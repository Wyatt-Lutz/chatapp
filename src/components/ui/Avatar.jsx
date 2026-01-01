import React from "react";

const Avatar = ({ size = 10, photoURL, name, className = "" }) => {
  const initials = (n = "") =>
    n
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const sizeClass = `w-${size} h-${size}`; // small helper; callers can pass sizes matching tailwind scale

  return (
    <div
      className={`rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden ${className}`}
      style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
    >
      {photoURL ? (
        <img src={photoURL} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-100">
          {initials(name)}
        </div>
      )}
    </div>
  );
};

export default Avatar;
