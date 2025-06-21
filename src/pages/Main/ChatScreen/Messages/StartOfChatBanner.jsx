import { useState } from "react";
import { useEffect } from "react";

const StartOfChatBanner = ({
  title,
  tempTitle,
  numOfMembers,
  isFirstMessageRendered,
  firstMessageID,
}) => {
  const [jsxNames, setJsxNames] = useState(null);
  useEffect(() => {
    const names = tempTitle.split(", ");
    const newJsxNames =
      names.length === 3
        ? `${names[0]}, ${names[1]}, and ${names[2]}`
        : names.length === 2
          ? `${names[0]} and ${names[1]}`
          : names[0];
    setJsxNames(newJsxNames);
  }, [tempTitle]);

  return (
    <div>
      {(isFirstMessageRendered || firstMessageID === "") &&
        (title ? (
          <div className="text-center text-lg mb-2">
            This is the start of <span className="font-semibold">{title}</span>
          </div>
        ) : numOfMembers > 3 ? (
          <div className="text-center text-lg mb-2">
            This is the start of your chat with{" "}
            <span className="font-semibold">
              {tempTitle + ", and " + numOfMembers - 3 + " other users"}
            </span>{" "}
          </div>
        ) : (
          <div className="text-center text-lg mb-2">
            This is the start of your chat with{" "}
            <span className="font-semibold">{jsxNames}</span>
          </div>
        ))}
    </div>
  );
};
export default StartOfChatBanner;
