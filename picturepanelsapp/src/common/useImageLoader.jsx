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
        console.log(imagesLoaded);
        setImagesLoaded({ ...imagesLoaded, [imageRef.current.src]: true });
      });
      imageRef.current.addEventListener("loadstart", function () {
        console.log("load starting");
        setAllImagesLoaded(false);
      });
    });

    return () => {
      imageRefs.foreach((imageRef) => {
        imageRef.re("load", function (e) {
          console.log("Image loaded", e);
        });
      });
    };
  }, [imageRefs]);

  return allImagesLoaded;
}
