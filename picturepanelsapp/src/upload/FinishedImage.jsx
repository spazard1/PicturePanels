import React from "react";
import { Button } from "react-bootstrap";
import PropTypes from "prop-types";
import UploadUserLogin from "./UploadUserLogin";
import serverUrl from "../common/ServerUrl";

import "./FinishedImage.css";

export default function FinishedImage({ imageDetails, onStartOver }) {
  return (
    <>
      <div className="uploadSidePanel">
        <div className="uploadTitle">Welcome to the Picture Panels upload page!</div>

        {<UploadUserLogin />}

        <div className="uploadStepInstructions">Your image has been saved.</div>

        <div className="imageInfoContainer">
          <div className="finishedImageName">{imageDetails.name}</div>

          {imageDetails.alternativeNames?.length > 0 && (
            <div className="finishedImageAlternativeNames">
              {imageDetails.alternativeNames.map((alternativeName) => (
                <div className="finishedImageAlternativeName" key={alternativeName}>
                  {alternativeName}
                </div>
              ))}
            </div>
          )}

          {imageDetails.tags?.length > 0 && (
            <div className="finishedImageTags">
              {imageDetails.tags.map((tag) => (
                <div className="finishedImageTag" key={tag}>
                  {tag}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="uploadButtonsContainer">
          <Button className="uploadButton" variant="info" onClick={onStartOver}>
            Upload Another Image
          </Button>
        </div>
      </div>
      <div className="uploadMainPanel">
        <div className="uploadImagePreviewContainer">
          <img className="uploadImagePreview" src={serverUrl + "api/images/" + imageDetails.id} />
        </div>
      </div>
    </>
  );
}

FinishedImage.propTypes = {
  imageDetails: PropTypes.object.isRequired,
  onStartOver: PropTypes.func.isRequired,
};
