import React, { useState } from "react";
import ServerUrl from "../common/ServerUrl";
import PropTypes from "prop-types";

import "./ChooseImage.css";

export default function ChooseImage({ onImageChosen }) {
  const [loadingMessage, setLoadingMessage] = useState();

  const onPasteUrl = (event) => {
    var pastedUrl = (event.clipboardData || window.clipboardData).getData("text");

    if (pastedUrl) {
      setLoadingMessage("Loading from URL...");
      uploadTemporaryUrl(pastedUrl);
      return;
    }

    var items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (let index in items) {
      var item = items[index];
      if (item.kind === "file") {
        setLoadingMessage("Loading from pasted image...");
        uploadTemporaryBlobAsync(item.getAsFile());
      }
    }
  };

  const onFileSelection = () => {
    var input = document.getElementById("imageFile");

    if (input.files && input.files[0]) {
      setLoadingMessage("Loading from file...");
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
      .then(async (responseJson) => {
        // setupCropper(responseJson.url);
        onImageChosen(responseJson.url);
        return responseJson;
      })
      .catch(function (error) {
        setLoadingMessage(error);
        return null;
      });
  }

  return (
    <>
      <div>{loadingMessage}</div>
      <div className="chooseImagePanel">
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
        <div className="imageFileDiv inputPanelElement">
          <input id="imageFile" type="file" className="imageFile hidden" accept="image/*" onChange={onFileSelection} />
          <label htmlFor="imageFile" className="uploadButton">
            Image from computer
          </label>{" "}
          or
        </div>
        <div className="imageUrlDiv inputPanelElement">
          <input type="text" className="imageUrl" autoComplete="off" placeholder="paste an image or url" onPaste={onPasteUrl} />
        </div>
      </div>

      <div className="loading hidden">
        <div className="loadingMessage">Uploading image...</div>
        <img src="img/loading.gif" />
      </div>
    </>
  );
}

ChooseImage.propTypes = {
  onImageChosen: PropTypes.func.isRequired,
};
