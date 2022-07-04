import React from "react";
import { useBodyClass } from "../common/useBodyClass";
import "./Upload.css";

export default function Upload() {
  useBodyClass("upload");

  return (
    <div id="mainDiv" className="center">
      <div id="uploadInputPanel" className="uploadInputPanel">
        <div id="messageResults" className="uploadResults imageInfoPanel hidden"></div>

        <div id="loginPanel" className="loginPanel hidden">
          <div className="inputPanelElement">
            <input type="button" id="loginButton" value="Login" />
            <br />
            <br />
            <a href="newuser">Create a new user</a>
          </div>
        </div>

        <div id="chooseImagePanel" className="chooseImagePanel hidden">
          <div className="uploadInstructions inputPanelElement">
            Choose an image from your computer or paste an image or URL. Images must be at least 1000px wide, so choose images that are large or high
            resolution.
            <br />
            <a
              target="_blank"
              href="https://www.google.com/search?q=sound%20of%20music%20movie&
                      tbm=isch&hl=en&tbs=isz:l&sa=X&ved=0CAEQpwVqFwoTCPihvqPSz-4CFQAAAAAdAAAAABAC&biw=1519&bih=731"
              rel="noreferrer"
            >
              {"Example 'Large' image search"}
            </a>
          </div>
          <div id="imageFileDiv" className="imageFileDiv inputPanelElement">
            <input type="file" id="imageFile" className="imageFile hidden" accept="image/*" />
            <label htmlFor="imageFile" className="uploadButton">
              Image from computer
            </label>{" "}
            or
          </div>
          <div id="imageUrlDiv" className="imageUrlDiv inputPanelElement">
            <input type="text" id="imageUrl" className="imageUrl" autoComplete="off" placeholder="paste an image or url" />
          </div>
        </div>

        <div id="cropperInstructions" className="cropperInstructions inputPanelElement hidden">
          Select either 16x9 or 4x3 aspect ratio, then crop the image if needed. For most images it is best to use 16x9.
        </div>

        <div id="imageInfoPanel" className="imageInfoPanel hidden">
          <div className="inputPanelElement">
            Image Name: <span data-toggle="tooltip" title="This is the name displayed when an image is solved."></span>
            <br />
            <input type="text" id="imageName" autoComplete="off" maxLength="100" />
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
            <input type="text" id="imageAlternativeName1" autoComplete="off" maxLength="100" />
          </div>
          <div className="imageAlternativeName">
            <input type="text" id="imageAlternativeName2" autoComplete="off" maxLength="100" />
          </div>
          <div className="inputPanelElement">
            <input type="text" id="imageAlternativeName3" autoComplete="off" maxLength="100" />
          </div>

          <div id="tagsInputContainer" className="inputPanelElement">
            Tags:{" "}
            <span
              data-toggle="tooltip"
              title="Tags allow images to be filtered when creating games, 
                    to customize which types of images will be in the game."
            ></span>
            <input id="tagsInput" name="input-custom-dropdown" className="tagsInput tagsInputSetupDefault" />
          </div>
        </div>

        <div id="uploadButtonsContainer" className="inputPanelElement uploadButtonsContainer hidden">
          <input type="button" id="uploadStartOverButton" className="uploadButton" value="Start Over" />
          <input type="button" id="uploadActionButton" className="uploadButton" value="Action" />
        </div>
      </div>

      <div id="croppedImageInfo" className="croppedImageInfo center hidden">
        <div id="imageSizeContainer">
          Cropped Image Size:
          <span id="imageWidth" className="imageDimension imageWidth"></span> X<span id="imageHeight" className=" imageDimension imageHeight"></span>
        </div>
        <div>
          Aspect Ratio:
          <input type="button" id="16x9Button" className="aspectRatioButton" value="16x9" />
          <input type="button" id="4x3Button" className="aspectRatioButton" value="4x3" />
        </div>
        <div id="imageSizeError" className="uploadErrorMessage hideIfEmpty"></div>
      </div>

      <div id="cropperContainer" className="imageContainer center hidden" draggable="false"></div>
      <div id="imagePreviewContainer" className="imageContainer center hidden" draggable="false"></div>
      <div id="helpMessageContainer" className="helpMessageContainer center hidden" draggable="false">
        <div id="userWelcomeMessage" className="helpMessage">
          Welcome to the Picture Panels upload page!
        </div>
        <div id="uploadedByImages" className="thumbnailsContainer"></div>
      </div>

      <div id="loading" className="loading hidden">
        <div id="loadingMessage" className="loadingMessage">
          Uploading image...
        </div>
        <img id="loadingGif" src="img/loading.gif" />
      </div>
    </div>
  );
}
