import { useEffect } from "react";
import { useRef } from "react";

export const useAudioNotifications = () => {
  const audioRef = useRef();
  const numberOfTimesPlayed = useRef(0);

  useEffect(() => {
    audioRef.current = new Audio("./notification.mp3");
  }, []);

  const playNotification = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        console.warn("notification play blocked");
      });
      numberOfTimesPlayed.current += 1;
    }
  };

  return { playNotification };
};
