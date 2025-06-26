export const validateSignin = (email, password) => {
  const errors = {};
  if (!email) {
    errors.email = "Please enter an email.";
  } else if (!/[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/.test(email)) {
    errors.email = "Please enter a valid email.";
  } else if (email.length > 254) {
    errors.email = "Please enter an email shorter than 254 characters.";
  }

  if (!password) {
    errors.password = "Please enter a password.";
  } else if (password.length < 6) {
    errors.password = "Please enter a password longer than 6 characters.";
  } else if (
    !/^[A-Za-z0-9$!@#%^&*()_\-+=\[\]{};:'",.<>/?`~\\|]+$/.test(password)
  ) {
    errors.password =
      "There are invalid characters in your password, it may be incorrect.";
  } else if (password.length > 128) {
    errors.password = "Please enter a password shorter than 128 characters.";
  }

  return errors;
};
