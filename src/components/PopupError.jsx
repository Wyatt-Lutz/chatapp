const PopupError = ({ message, onClose, type = "error" }) => {
  const typeDependentCSS = {
    error: "bg-red-100 text-red-800 border-red-400",
    success: "bg-green-100 text-green-800 border-green-400",
  };
  return (
    <div
      className={`px-4 max-w-2xl shadow-lg w-full p-6 by-2 rounded-lg mb-2 text-sm ${typeDependentCSS[type]}`}
    >
      {message}
    </div>
  );
};
export default PopupError;
