import React from "react";
import PropTypes from "prop-types";
import UploadUserLogin from "./UploadUserLogin";
import UserThumbnails from "./UserThumbnails";

import "./ChooseImage.css";

export default function ChooseImage({ isLoading, onImageChosen }) {
  const onPasteUrl = (event) => {
    var pastedUrl = (event.clipboardData || window.clipboardData).getData("text");

    if (pastedUrl) {
      onImageChosen(pastedUrl);
      return;
    }

    var items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (let index in items) {
      var item = items[index];
      if (item.kind === "file") {
        onImageChosen(item.getAsFile());
      }
    }
  };

  const onFileSelection = () => {
    var input = document.getElementById("imageFile");

    if (input.files && input.files[0]) {
      onImageChosen(input.files[0]);
    }
  };

  return (
    <>
      <div className="uploadSidePanel">
        <div className="uploadTitle">Welcome to the Picture Panels upload page!</div>

        {<UploadUserLogin />}

        <div className="uploadStepInstructions">Step 1 of 3: Choose an image from your computer or paste an image or URL.</div>

        <div className="chooseImageInstructions">
          {"Images must be at least 1000px wide, so choose images that are large or high resolution. "}
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

        <div className="chooseImageContainer">
          <div className="chooseImageFile">
            <input id="imageFile" type="file" className="imageFile hidden" accept="image/*" onChange={onFileSelection} disabled={isLoading} />
            <label htmlFor="imageFile" className="chooseImageButton" disabled={isLoading}>
              Image from computer
            </label>{" "}
          </div>
          <div className="chooseImageUrl">
            <input
              type="text"
              className="imageUrl"
              autoComplete="off"
              placeholder="paste an image or url"
              onPaste={onPasteUrl}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
      <div className="uploadMainPanel">
        <UserThumbnails />
      </div>
    </>
  );
}

ChooseImage.propTypes = {
  isLoading: PropTypes.bool,
  onImageChosen: PropTypes.func.isRequired,
};
