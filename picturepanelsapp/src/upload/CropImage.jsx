import React, { useCallback, useRef, useState } from "react";
import PropTypes from "prop-types";
import Cropper from "cropperjs";
import { useEffect } from "react";
import { Button } from "react-bootstrap";

import "cropperjs/dist/cropper.css";
import "./CropImage.css";

export default function CropImage({ imageUrl, onError }) {
  const cropperRef = useRef();
  const cropperContainerRef = useRef();
  const [imageDetails, setImageDetails] = useState();

  const setRatio = useCallback((ratio) => {
    cropperRef.current?.setAspectRatio(ratio);
  }, []);

  useEffect(() => {
    Cropper.setDefaults({
      viewMode: 0,
      initialAspectRatio: 16 / 9,
      guides: false,
      highlight: false,
      dragMode: "move",
      autoCropArea: 1,
      zoomable: false,
      movable: false,
      rotatable: false,
    });
  }, []);

  useEffect(() => {
    if (!imageDetails?.detail) {
      return;
    }

    console.log(imageDetails?.detail);

    var aspectRatio = (imageDetails.detail.width / imageDetails.detail.height).toFixed(2);

    var imageWidth = Math.ceil(imageDetails.detail.width);
    //var imageHeight = Math.ceil(imageDetails.detail.height);

    //document.getElementById("imageWidth").innerHTML = imageWidth;
    //document.getElementById("imageHeight").innerHTML = imageHeight;

    if (imageDetails.detail.width < 1000) {
      onError("Image width must be at least 1000 pixels. The cropped image is " + (1000 - imageWidth) + " pixels too small.");
    } else if (aspectRatio > 1.85) {
      onError("Aspect Ratio must be less than 1.85. The cropped image is too wide.");
      document.getElementById("uploadActionButton").disabled = "disabled";
    } else if (aspectRatio < 1.3) {
      onError("Aspect Ratio must be greater than 1.3. The cropped image is too square.");
      document.getElementById("uploadActionButton").disabled = "disabled";
    } else {
      onError();
    }
  }, [imageDetails, onError]);

  useEffect(() => {
    if (!imageUrl) {
      return;
    }

    if (cropperRef.current) {
      cropperRef.current.replace(imageUrl);
      return;
    }

    cropperRef.current = new Cropper(cropperContainerRef.current, {
      aspectRatio: 16 / 9,
      crop(event) {
        setImageDetails(event);
      },
    });
  }, [imageUrl]);

  return (
    <>
      <div className="cropperInstructions">
        Select either 16x9 or 4x3 aspect ratio, then crop the image if needed.
        <br />
        For most images it is best to use 16x9.
      </div>

      <div className="croppedImageInfoContainer">
        <div className="croppedImageSizeContainer">
          Cropped Image Size: {Math.round(imageDetails?.detail?.width)} x {Math.round(imageDetails?.detail?.height)}
        </div>
        <div className="aspectRatioContainer">
          <div>Aspect Ratio:</div>
          <Button className="aspectRatioButton" onClick={() => setRatio(16 / 9)}>
            16x9
          </Button>
          <Button className="aspectRatioButton" onClick={() => setRatio(4 / 3)}>
            4x3
          </Button>
        </div>
      </div>
      <div className="cropperContainer">
        <img src={imageUrl} ref={cropperContainerRef} />
      </div>
    </>
  );
}

CropImage.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  onError: PropTypes.func.isRequired,
};
