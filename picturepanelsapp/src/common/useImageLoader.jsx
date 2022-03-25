import { useEffect, useState } from "react";

export function useImageLoader(imageRefs) {
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState({});

  useEffect(() => {
    if (!imageRefs || !imageRefs[0]) {
      return;
    }

    imageRefs.forEach((imageRef) => {
      imageRef.current.addEventListener("load", function () {
        setImagesLoaded({ ...imagesLoaded, [imageRef.current.src]: true });
      });
      imageRef.current.addEventListener("loadstart", function () {
        setAllImagesLoaded(false);
      });
    });

    return () => {
      imageRefs.foreach((imageRef) => {
        imageRef.re("load", function () {});
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageRefs]);

  return allImagesLoaded;
}
