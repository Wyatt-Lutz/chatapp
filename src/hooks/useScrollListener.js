import { useEffect } from "react";

export const useScrollListener = (ref, isAtBottom, messageDispatch) => {
  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      if (scrollTop !== 0 && isAtBottom) {
        messageDispatch({ type: "UPDATE_IS_AT_BOTTOM", payload: false });
      } else if (scrollTop === 0 && !isAtBottom) {
        messageDispatch({ type: "UPDATE_IS_AT_BOTTOM", payload: true });
        messageDispatch({ type: "UPDATE_UNREAD", payload: 0 });
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [ref, isAtBottom, messageDispatch]);
};
