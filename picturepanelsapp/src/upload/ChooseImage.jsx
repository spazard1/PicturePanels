import React from "react";
import ServerUrl from "../common/ServerUrl";
import PropTypes from "prop-types";
import UploadUserLogin from "./UploadUserLogin";
import UserThumbnails from "./UserThumbnails";

import "./ChooseImage.css";

export default function ChooseImage({ isLoading, onImageChosen }) {
  const onPasteUrl = (event) => {
    var pastedUrl = (event.clipboardData || window.clipboardData).getData("text");

    if (pastedUrl) {
      uploadTemporaryUrl(pastedUrl);
      return;
    }

    var items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (let index in items) {
      var item = items[index];
      if (item.kind === "file") {
        uploadTemporaryBlobAsync(item.getAsFile());
      }
    }
  };

  const onFileSelection = () => {
    var input = document.getElementById("imageFile");

    if (input.files && input.files[0]) {
      uploadTemporaryBlobAsync(input.files[0]);
    }
  };

  const uploadTemporaryUrl = (uploadUrl) => {
    fetch(ServerUrl + "api/images/uploadTemporaryUrl", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("userToken"),
      },
      body: JSON.stringify({
        url: uploadUrl,
      }),
    }).then(handleUploadTemporary);
  };

  const uploadTemporaryBlobAsync = (blob) => {
    fetch(ServerUrl + "api/images/uploadTemporaryBlob", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("userToken"),
      },
      body: blob,
    }).then(handleUploadTemporary);
  };

  function handleUploadTemporary(response) {
    Promise.resolve()
      .then(async () => {
        if (!response.ok) {
          throw new Error(await response.text());
        }
        return response.json();
      })
      .then((responseJson) => {
        onImageChosen(responseJson);
        return responseJson;
      })
      .catch(function () {
        return null;
      });
  }

  return (
    <>
      <div className="uploadSidePanel">
        <div className="uploadTitle">Welcome to the Picture Panels upload page!</div>

        {<UploadUserLogin />}

        <div className="uploadStepInstructions">Step 1 of 3: Choose an image from your computer or paste an image or URL.</div>

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
        <div className="chooseImageInstructions">
          {"Images must be at least 1000px wide, so choose images that are large or high resolution. "}
          <a
            target="_blank"
            href="https://www.google.com/search?q=sound%20of%20music%20movie&
                  tbm=isch&hl=en&tbs=isz:l&sa=X&ved=0CAEQpwVqFwoTCPihvqPSz-4CFQAAAAAdAAAAABAC&biw=1519&bih=731"
            rel="noreferrer"
          >
            {"Example 'Large' image search"}
          </a>
        </div>

        <UserThumbnails />
      </div>
    </>
  );
}

ChooseImage.propTypes = {
  isLoading: PropTypes.bool,
  onImageChosen: PropTypes.func.isRequired,
};
