import React, { useCallback, useContext, useState } from "react";
import UserContext from "../user/UserContext";
import { useBodyClass } from "../common/useBodyClass";
import UploadUserLogin from "./UploadUserLogin";
import ChooseImage from "./ChooseImage";
import CropImage from "./CropImage";
import SetImageInfo from "./SetImageInfo";
import UserThumbnails from "./UserThumbnails";

import "./Upload.css";
import postImage from "./postImage";

export default function Upload() {
  const { user } = useContext(UserContext);
  const [uploadStep, setUploadStep] = useState("ChooseImage");
  const [imageUrl, setImageUrl] = useState();
  const [imageId, setImageId] = useState();

  useBodyClass("upload");

  const onImageChosen = useCallback((imageDetails) => {
    setImageUrl(imageDetails.url);
    setImageId(imageDetails.imageId);
    setUploadStep("CropImage");
  }, []);

  const onCroppedImage = useCallback(
    (cropperData) => {
      postImage(cropperData, imageId, (ie) => {
        if (ie) {
          setUploadStep("SetImageInfo");
        }
      });
    },
    [imageId]
  );

  const onImageInfo = useCallback((imageInfo) => {
    console.log(imageInfo);
  }, []);

  return (
    <div className="uploadContainer">
      <div className="uploadSidePanel">
        <div className="uploadTitle">Welcome to the Picture Panels upload page!</div>

        {<UploadUserLogin />}

        <div className="uploadStepInstructions">
          {uploadStep === "ChooseImage" && "Step 1 of 3: Choose an image from your computer or paste an image or URL."}
          {uploadStep === "CropImage" && "Step 2 of 3: Crop the image. Select either 16x9 or 4x3 aspect ratio, then crop the image if needed."}
          {uploadStep === "SetImageInfo" && "Step 3 of 3: Enter image details."}
        </div>
      </div>
      <div className="uploadMainPanel">
        {user && (
          <>
            {uploadStep === "ChooseImage" && <ChooseImage onImageChosen={onImageChosen} />}
            {uploadStep === "CropImage" && <CropImage imageUrl={imageUrl} onCroppedImage={onCroppedImage} />}
            {uploadStep === "SetImageInfo" && <SetImageInfo onImageInfo={onImageInfo} />}
            {uploadStep === "ChooseImage" && <UserThumbnails />}
          </>
        )}
      </div>
    </div>
  );
}
