let showToastFn = () => {};

/**
 * Replaces showToastFn with showToast() in ToastProvider once it mounts.
 * @param {Function} fn
 */
export const registerToast = (fn) => {
  showToastFn = fn;
};

/**
 * showToast fn used in service files instead of the ToastProvider showToast() which can only be used in components.
 * @param {string} message - Message to display in the toast
 * @param {"success" | "error"} [type="error"] - Type of toast to display
 * @param {number} [duration=3000] - Duration the toast is displayed (in ms)
 */
export const showToast = (message, type, duration) => {
  showToastFn(message, type, duration);
};
