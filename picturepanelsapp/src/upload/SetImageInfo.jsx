import React from "react";
//import ServerUrl from "../common/ServerUrl";
// import PropTypes from "prop-types";

export default function SetImageInfo() {
  return (
    <>
      <div className="uploadInputPanel">
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
      </div>
    </>
  );
}

SetImageInfo.propTypes = {};
