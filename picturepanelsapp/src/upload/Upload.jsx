import React, { useCallback, useContext, useState } from "react";
import UserContext from "../user/UserContext";
import { useBodyClass } from "../common/useBodyClass";
import UploadUserLogin from "./UploadUserLogin";
import ChooseImage from "./ChooseImage";
import CropImage from "./CropImage";
import SetImageInfo from "./SetImageInfo";
import UserThumbnails from "./UserThumbnails";

import "./Upload.css";

export default function Upload() {
  const { user } = useContext(UserContext);
  const [uploadStep, setUploadStep] = useState("ChooseImage");
  const [imageUrl, setImageUrl] = useState();

  useBodyClass("upload");

  const onImageChosen = useCallback((url) => {
    setImageUrl(url);
    setUploadStep("CropImage");
  }, []);

  return (
    <>
      <div className="helpMessageContainer center">
        <div className="helpMessage">Welcome to the Picture Panels upload page!</div>
        <div className="thumbnailsContainer"></div>
      </div>

      {!user && <UploadUserLogin />}

      {user && (
        <>
          {uploadStep === "ChooseImage" && <ChooseImage onImageChosen={onImageChosen} />}
          {uploadStep === "CropImage" && <CropImage imageUrl={imageUrl} />}
          {uploadStep === "SetImageInfo" && <SetImageInfo imageUrl={imageUrl} />}
          <UserThumbnails />
        </>
      )}

      <div className="imageContainer center" draggable="false"></div>

      <div className="loading hidden">
        <div className="loadingMessage">Uploading image...</div>
        <img src="img/loading.gif" />
      </div>
    </>
  );
}
