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

  const onError = useCallback((message) => {
    if (!message) {
      return;
    }
    console.error(message);
  }, []);

  return (
    <div className="uploadContainer">
      <div className="uploadSidePanel">
        <div className="uploadTitle">Welcome to the Picture Panels upload page!</div>

        {!user && <UploadUserLogin />}
      </div>
      <div className="uploadMainPanel">
        {user && (
          <>
            {uploadStep === "ChooseImage" && <ChooseImage onImageChosen={onImageChosen} />}
            {uploadStep === "CropImage" && <CropImage imageUrl={imageUrl} onError={onError} />}
            {uploadStep === "SetImageInfo" && <SetImageInfo imageUrl={imageUrl} />}
            <UserThumbnails />
          </>
        )}
      </div>
    </div>
  );
}
