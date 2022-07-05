import React from "react";
import PropTypes from "prop-types";

import "./CropImage.css";

export default function CropImage({ imageUrl }) {
  return (
    <>
      <div>{imageUrl}</div>
      <div className="cropperInstructions inputPanelElement">
        Select either 16x9 or 4x3 aspect ratio, then crop the image if needed. For most images it is best to use 16x9.
      </div>

      <div className="croppedImageInfo center">
        <div>
          Cropped Image Size:
          <span className="imageDimension imageWidth"></span> X<span className="imageDimension imageHeight"></span>
        </div>
        <div>
          Aspect Ratio:
          <input type="button" className="aspectRatioButton" value="16x9" />
          <input type="button" className="aspectRatioButton" value="4x3" />
        </div>
        <div className="uploadErrorMessage hideIfEmpty"></div>
      </div>
    </>
  );
}

CropImage.propTypes = {
  imageUrl: PropTypes.string.isRequired,
};
