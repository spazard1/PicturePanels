import React from "react";
import { Button } from "react-bootstrap";
import PropTypes from "prop-types";
import UploadUserLogin from "./UploadUserLogin";
import serverUrl from "../common/ServerUrl";

import "./SetImageInfo.css";

export default function SetImageInfo({ imageId, onStartOver, onSaveImage }) {
  return (
    <>
      <div className="uploadSidePanel">
        <div className="uploadTitle">Welcome to the Picture Panels upload page!</div>

        {<UploadUserLogin />}

        <div className="uploadStepInstructions">Step 3 of 3: Enter the image details.</div>

        <div className="imageInfoPanel">
          <div className="inputPanelElement">
            Image Name: <span data-toggle="tooltip" title="This is the name displayed when an image is solved."></span>
            <br />
            <input type="text" autoComplete="off" maxLength="100" />
          </div>

          <div className="inputPanelElement">
            Often there will be more than one answer for an image. The image name and these other names will all be accepted as correct answers.
          </div>

          <div className="imageAlternativeName">
            Other Names:{" "}
            <span
              data-toggle="tooltip"
              title="For example, for an image from 'Star Wars: The Empire Strikes Back', 
						other names would include 'Star Wars: Episode 5' and 'The Empire Strikes Back.'"
            ></span>
            <br />
            <input type="text" autoComplete="off" maxLength="100" />
          </div>
          <div className="imageAlternativeName">
            <input type="text" autoComplete="off" maxLength="100" />
          </div>
          <div className="inputPanelElement">
            <input type="text" autoComplete="off" maxLength="100" />
          </div>

          <div className="inputPanelElement">
            Tags:{" "}
            <span
              data-toggle="tooltip"
              title="Tags allow images to be filtered when creating games, 
						to customize which types of images will be in the game."
            ></span>
            <input name="input-custom-dropdown" className="tagsInput tagsInputSetupDefault" />
          </div>
        </div>

        <div className="inputPanelElement uploadButtonsContainer">
          <input type="button" className="uploadButton" value="Start Over" />
          <input type="button" className="uploadButton" value="Action" />
        </div>

        <div className="cropperButtons">
          <Button variant="light" className="cropperButton" onClick={onStartOver}>
            Start Over
          </Button>
          <Button variant="info" className="cropperButton" onClick={onSaveImage}>
            SaveImage
          </Button>
        </div>
      </div>
      <div className="uploadMainPanel">
        <div className="uploadImagePreviewContainer">
          <img className="uploadImagePreview" src={serverUrl + "api/images/" + imageId} />
        </div>
      </div>
    </>
  );
}

SetImageInfo.propTypes = {
  imageId: PropTypes.string.isRequired,
  onStartOver: PropTypes.func.isRequired,
  onSaveImage: PropTypes.func.isRequired,
};
