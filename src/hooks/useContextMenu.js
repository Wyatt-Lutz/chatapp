import { useEffect, useState } from "react";

export const useContextMenu = () => {
  const [contextMenu, setContextMenu] = useState({});
  const [points, setPoints] = useState({x: 0, y: 0});

  useEffect(() => {
    const handleClick = () => {
      setContextMenu({});
    }

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    }
  }, []);

  return {contextMenu, setContextMenu, points, setPoints };
}
