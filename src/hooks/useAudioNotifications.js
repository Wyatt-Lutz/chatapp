import { useEffect, useRef } from "react";

export const useAudioNotifications = () => {
  const audioRef = useRef();
  const numberOfTimesPlayed = useRef(0);

  useEffect(() => {
    audioRef.current = new Audio("./notification.mp3");
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        numberOfTimesPlayed.current = 0;
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const playNotification = () => {
    if (
      audioRef.current &&
      document.hidden &&
      numberOfTimesPlayed.current < 3
    ) {
      audioRef.current.play().catch((error) => {
        console.warn("notification play blocked: " + error);
        return;
      });
      numberOfTimesPlayed.current += 1;
    }
  };

  return { playNotification };
};
