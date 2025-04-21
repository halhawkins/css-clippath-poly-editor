import React, {FC, useRef, useState, useEffect} from "react";
import { Image } from "react-konva";
const URLImage: FC<{
    src: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    rotation?: number;
    opacity?: number;
  }> = ({ src, x, y, width, height, rotation, opacity }) => {
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
  
    const handleLoad = () => {
      setImage(imageRef.current);
    };
  
    const loadImage = () => {
      const img = new window.Image();
      img.src = src;
      img.crossOrigin = "Anonymous";
      imageRef.current = img;
      img.width = width || 0;
      img.height = height || 0;
      rotation = rotation || 0;
      opacity = opacity || 1;
      // img.onload = handleLoad;
      img.addEventListener("load", handleLoad);
      img.onload = () => {
        setImage(img);
      }
    };

    useEffect(() => {
      console.log("Image loaded:", src)
    }, []);
  
    useEffect(() => {
      loadImage();
    }, [src]);
  
    return (
      <>
        {image && (
        <Image
          image={image || undefined}
          x={x}
          y={y}
          width={width}
          height={height}
          rotation={rotation}
          opacity={opacity}
        />
        )}
      </>
    );
  };
  
  export default URLImage;