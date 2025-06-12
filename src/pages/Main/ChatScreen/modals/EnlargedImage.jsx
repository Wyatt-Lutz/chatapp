import { useEffect, useRef } from "react";

const EnlargedImage = ({ imageSrc, setIsPictureEnlarged }) => {
  const imageRef = useRef(null);

  useEffect(() => {
    const onClickOutsideImage = (e) => {
      if (!imageRef.current.contains(e.target)) {
        setIsPictureEnlarged(false);
      }
    };

    document.addEventListener("mousedown", onClickOutsideImage);
    return () => document.removeEventListener("mousedown", onClickOutsideImage);
  }, [imageRef.current, setIsPictureEnlarged]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80">
      <img className="h-200" ref={imageRef} src={imageSrc} />
    </div>
  );
};
export default EnlargedImage;
