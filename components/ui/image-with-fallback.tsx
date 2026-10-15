import Image from "next/image";
import { useEffect, useState } from "react";

export const ImageWithFallback = ({ src, alt, fallbackSrc, ...props }: any) => {
  const defaultFallback = "/images/bali-destination.jpg";
  const initialSrc = src || fallbackSrc || defaultFallback;
  const [imgSrc, setImgSrc] = useState(initialSrc);

  useEffect(() => {
    setImgSrc(src || fallbackSrc || defaultFallback);
  }, [src, fallbackSrc, defaultFallback]);

  return (
    <Image 
      src={imgSrc} 
      alt={alt} 
      onError={() => {
        if (imgSrc !== (fallbackSrc || defaultFallback)) {
          setImgSrc(fallbackSrc || defaultFallback);
        }
      }} 
      {...props} 
    />
  );
};
