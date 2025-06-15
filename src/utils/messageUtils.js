import dayjs from "dayjs";

export const calcTime = (time) => {
  const formattedTime = dayjs(time).format("h:mm A");
  const today = new Date();
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const yesterdayMidnight = new Date(todayMidnight);
  yesterdayMidnight.setDate(todayMidnight.getDate() - 1);
  if (time - todayMidnight.getTime() > 0) {
    return formattedTime;
  } else if (time - yesterdayMidnight.getTime() > 0) {
    return "Yesterday at " + formattedTime;
  }
  return dayjs(time).format("MM/DD/YYYY h:m A");
};

/**
 * Determines whether to show the timestamp and the username of user for a message.
 * Will not render them if the last message was sent by the client user and the last message was less than 5 minutes ago.
 * @param {*} lastMessage
 * @param {*} currUser
 * @returns {Boolean}
 */
export const calculateRenderTimeAndSender = (lastMessage, currUserUid) => {
  if (!lastMessage) return false;

  const currTime = Date.now();

  if (
    new Date(currTime).getDay() !== new Date(lastMessage.timestamp).getDay()
  ) {
    return true;
  }

  return !(
    lastMessage.sender === currUserUid &&
    currTime - lastMessage.timestamp < 180000
  );
};
