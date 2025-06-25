export const validateSignup = (username, email, password) => {
  const errors = {};

  if (!username) {
    errors.username = "Please enter a username.";
  } else if (username.length > 15) {
    errors.username = "Please enter a username shorter than 15 characters.";
  } else if (!/^[A-Za-z0-9]+$/.test(username)) {
    errors.username = "Please enter a username with only letters and numbers.";
  }

  if (!email) {
    errors.email = "Please enter an email.";
  } else if (email.length > 254) {
    errors.email = "Please enter a email shorter than 254 characters.";
  } else if (!/[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/.test(email)) {
    errors.email = "Please enter a valid email.";
  }

  if (!password) {
    errors.password = "Please enter a password.";
  } else if (password.length < 6) {
    errors.password = "Please enter a password longer than 6 characters.";
  } else if (password.length > 128) {
    errors.password = "Please enter a password shorter than 128 characters.";
  } else if (
    !/^[A-Za-z0-9$!@#%^&*()_\-+=[\]{};:'",.<>/?`~\\|]+$/.test(password)
  ) {
    errors.password = "Please enter a password with valid characters.";
  }

  return errors;
};
