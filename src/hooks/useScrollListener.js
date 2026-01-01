import { useEffect } from "react";

export const useScrollListener = (ref, isAtBottom, messageDispatch) => {
  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const nearBottom = scrollHeight - scrollTop - clientHeight <= 8;

      if (nearBottom && !isAtBottom) {
        messageDispatch({ type: "UPDATE_IS_AT_BOTTOM", payload: true });
        messageDispatch({ type: "UPDATE_UNREAD", payload: 0 });
      } else if (!nearBottom && isAtBottom) {
        messageDispatch({ type: "UPDATE_IS_AT_BOTTOM", payload: false });
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [ref, isAtBottom, messageDispatch]);
};
