import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import Cropper from "cropperjs";
import { Button } from "react-bootstrap";
import UploadUserLogin from "./UploadUserLogin";

import "cropperjs/dist/cropper.css";
import "./CropImage.css";

export default function CropImage({ isLoading, imageUrl, onReadyToCrop, onStartOver, onCroppedImage }) {
  const cropperRef = useRef();
  const cropperContainerRef = useRef();
  const [imageDetails, setImageDetails] = useState();
  const [imageError, setImageError] = useState();
  const [aspectRatio, setAspectRatio] = useState(16 / 9);

  useEffect(() => {
    if (aspectRatio <= 0) {
      return;
    }

    Cropper.setDefaults({
      viewMode: 0,
      initialAspectRatio: aspectRatio,
      guides: false,
      highlight: false,
      dragMode: "move",
      autoCropArea: 1,
      zoomable: false,
      movable: false,
      rotatable: false,
    });
  }, [aspectRatio]);

  useEffect(() => {
    if (aspectRatio <= 0) {
      return;
    }
    cropperRef.current?.setAspectRatio(aspectRatio);
  }, [aspectRatio]);

  const onClickCroppedImage = useCallback(() => {
    cropperRef.current.disable();
    onCroppedImage(cropperRef.current.getData(true));
  }, [onCroppedImage]);

  useEffect(() => {
    if (!imageDetails?.detail) {
      return;
    }

    var aspectRatio = (imageDetails.detail.width / imageDetails.detail.height).toFixed(2);

    var imageWidth = Math.ceil(imageDetails.detail.width);
    //var imageHeight = Math.ceil(imageDetails.detail.height);

    //document.getElementById("imageWidth").innerHTML = imageWidth;
    //document.getElementById("imageHeight").innerHTML = imageHeight;

    if (imageDetails.detail.width < 1000) {
      setImageError("The cropped image is " + (1000 - imageWidth) + " pixels too small.");
    } else if (aspectRatio > 1.85) {
      setImageError("Aspect Ratio must be less than 1.85. The cropped image is too wide.");
      document.getElementById("uploadActionButton").disabled = "disabled";
    } else if (aspectRatio < 1.3) {
      setImageError("Aspect Ratio must be greater than 1.3. The cropped image is too square.");
      document.getElementById("uploadActionButton").disabled = "disabled";
    } else {
      setImageError();
    }
  }, [imageDetails]);

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
      ready() {
        onReadyToCrop();
      },
    });
  }, [imageUrl, onReadyToCrop]);

  return (
    <>
      <div className="uploadSidePanel">
        <div className="uploadTitle">Welcome to the Picture Panels upload page!</div>

        {<UploadUserLogin />}

        <div className="uploadStepInstructions">
          Step 2 of 3: Crop the image. Select either 16x9 or 4x3 aspect ratio, then crop the image if needed.
        </div>

        <div className="cropperButtons">
          <Button variant="light" className="cropperButton" onClick={onStartOver} disabled={isLoading}>
            Start Over
          </Button>
          <Button variant="info" className="cropperButton" onClick={onClickCroppedImage} disabled={imageError || isLoading}>
            Done Cropping
          </Button>
        </div>
      </div>
      <div className="uploadMainPanel">
        {imageDetails?.detail && (
          <>
            <div className="croppedImageInfoContainer">
              <>
                {imageError && <div className="imageError">{imageError}</div>}
                {!imageError && (
                  <div className="croppedImageSizeContainer">
                    Cropped Image Size: {Math.round(imageDetails?.detail?.width)} x {Math.round(imageDetails?.detail?.height)}
                  </div>
                )}
                <div className="aspectRatioContainer">
                  <div>Aspect Ratio:</div>
                  <Button
                    className="aspectRatioButton"
                    variant={aspectRatio === 16 / 9 ? "info" : "light"}
                    onClick={() => setAspectRatio(16 / 9)}
                    disabled={isLoading}
                  >
                    16x9
                  </Button>
                  <Button
                    className="aspectRatioButton"
                    variant={aspectRatio === 4 / 3 ? "info" : "light"}
                    onClick={() => setAspectRatio(4 / 3)}
                    disabled={isLoading}
                  >
                    4x3
                  </Button>
                </div>
              </>
            </div>
          </>
        )}
        <div className="cropperContainer">
          <img className="cropperImage" src={imageUrl} ref={cropperContainerRef} />
        </div>
      </div>
    </>
  );
}

CropImage.propTypes = {
  isLoading: PropTypes.bool,
  imageUrl: PropTypes.string.isRequired,
  onReadyToCrop: PropTypes.func.isRequired,
  onStartOver: PropTypes.func.isRequired,
  onCroppedImage: PropTypes.func.isRequired,
};
