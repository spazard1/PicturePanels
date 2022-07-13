import React, { useCallback, useContext, useState } from "react";
import UserContext from "../user/UserContext";
import { useBodyClass } from "../common/useBodyClass";
import ChooseImage from "./ChooseImage";
import CropImage from "./CropImage";
import SetImageInfo from "./SetImageInfo";
import postImage from "./postImage";
import ModalConfirm from "../common/modal/ModalConfirm";
import { useModal } from "../common/modal/useModal";

import "./Upload.css";
import UploadUserLogin from "./UploadUserLogin";
import putImage from "./putImage";

export default function Upload() {
  const { user } = useContext(UserContext);
  const [uploadStep, setUploadStep] = useState("ChooseImage");
  const [imageUrl, setImageUrl] = useState();
  const [imageId, setImageId] = useState();
  const [modalConfirmMessage, setModalConfirmMessage, onModalConfirmClose] = useModal();

  useBodyClass("upload");

  const onStartOver = useCallback(() => {
    setModalConfirmMessage("Are you sure you want to start over?");
  }, [setModalConfirmMessage]);

  const onModalConfirmResponse = useCallback(
    (response) => {
      if (response) {
        setImageId();
        setImageUrl();
        setUploadStep("ChooseImage");
      }

      setModalConfirmMessage("");
    },
    [setModalConfirmMessage]
  );

  const onImageChosen = useCallback((imageDetails) => {
    console.log(imageDetails);

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

  const onSaveImage = useCallback(
    (imageInfo) => {
      putImage(imageInfo, imageId, (ie) => {
        if (ie) {
          console.log("done", ie);
        }
      });
    },
    [imageId]
  );

  return (
    <>
      <ModalConfirm modalMessage={modalConfirmMessage} onModalResponse={onModalConfirmResponse} onModalClose={onModalConfirmClose}></ModalConfirm>

      <div className="uploadContainer">
        {!user && <UploadUserLogin />}
        {user && (
          <>
            {uploadStep === "ChooseImage" && <ChooseImage onImageChosen={onImageChosen} />}
            {uploadStep === "CropImage" && <CropImage imageUrl={imageUrl} onStartOver={onStartOver} onCroppedImage={onCroppedImage} />}
            {uploadStep === "SetImageInfo" && <SetImageInfo imageId={imageId} onStartOver={onStartOver} onSaveImage={onSaveImage} />}
          </>
        )}
      </div>
    </>
  );
}
