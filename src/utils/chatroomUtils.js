/**
 * Removes the current user's username from the tempTitle.
 * @param {*} tempTitle
 */
export const reduceTempTitle = (tempTitle, username) => {
  const newTempTitle = tempTitle.split(', ').filter((name) => name !== username).join(', ');
  return newTempTitle;
}