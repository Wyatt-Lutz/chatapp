/**
 * Removes the current user's username from the tempTitle.
 * @param {string} tempTitle - The old tempTitle
 * @param {string} username - Username to remove from tempTitle
 * @param {string} newUsername - The new username to add to tempTitle (optional)
 */
export const updateTempTitle = (tempTitle, username, newUsername = "") => {
  const filteredNames = tempTitle.split(', ').filter((name) => name !== username);
  if (newUsername) {
    filteredNames.push(newUsername);
  }

  return filteredNames.join(", ");
}
