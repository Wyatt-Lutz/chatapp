/**
 * Removes the current user's username from the membersTitle.
 * @param {string} membersTitle - The old membersTitle
 * @param {string} username - Username to remove from membersTitle
 * @param {string} newUsername - The new username to add to membersTitle (optional)
 */
export const updateMembersTitle = (
  membersTitle,
  username,
  newUsername = "",
) => {
  const filteredNames = membersTitle
    .split(", ")
    .filter((name) => name !== username);
  if (newUsername) {
    filteredNames.push(newUsername);
  }

  return filteredNames.join(", ");
};
