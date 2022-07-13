import React, { useCallback, useContext, useState } from "react";
import UserContext from "../user/UserContext";
import { useBodyClass } from "../common/useBodyClass";
import ChooseImage from "./ChooseImage";
import CropImage from "./CropImage";
import SetImageInfo from "./SetImageInfo";
import postImage from "./postImage";
import ModalConfirm from "../common/modal/ModalConfirm";
import { useModal } from "../common/modal/useModal";
import UploadUserLogin from "./UploadUserLogin";
import putImage from "./putImage";
import { Toast, ToastContainer } from "react-bootstrap";

import "./Upload.css";

export default function Upload() {
  const { user } = useContext(UserContext);
  const [uploadStep, setUploadStep] = useState("ChooseImage");
  const [imageUrl, setImageUrl] = useState();
  const [imageId, setImageId] = useState();
  const [loadingMessage, setLoadingMessage] = useState();
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
    setImageUrl(imageDetails.url);
    setImageId(imageDetails.imageId);
    setUploadStep("CropImage");
    setLoadingMessage("Loading image...");
  }, []);

  const onReadyToCrop = useCallback(() => {
    setLoadingMessage();
  }, []);

  const onCroppedImage = useCallback(
    (cropperData) => {
      setLoadingMessage("Cropping image...");

      postImage(cropperData, imageId, (ie) => {
        setLoadingMessage();

        if (ie) {
          setUploadStep("SetImageInfo");
        }
      });
    },
    [imageId]
  );

  const onSaveImage = useCallback(
    (imageInfo) => {
      setLoadingMessage("Saving image details...");

      putImage(imageInfo, imageId, (ie) => {
        setLoadingMessage();
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
      <ToastContainer position={"middle-center"}>
        <Toast show={!!loadingMessage} bg="info">
          {loadingMessage}
        </Toast>
      </ToastContainer>

      <div className="uploadContainer">
        {!user && <UploadUserLogin />}
        {user && (
          <>
            {uploadStep === "ChooseImage" && <ChooseImage isLoading={!!loadingMessage} onImageChosen={onImageChosen} />}
            {uploadStep === "CropImage" && (
              <CropImage
                isLoading={!!loadingMessage}
                onReadyToCrop={onReadyToCrop}
                imageUrl={imageUrl}
                onStartOver={onStartOver}
                onCroppedImage={onCroppedImage}
              />
            )}
            {uploadStep === "SetImageInfo" && (
              <SetImageInfo isLoading={!!loadingMessage} imageId={imageId} onStartOver={onStartOver} onSaveImage={onSaveImage} />
            )}
          </>
        )}
      </div>
    </>
  );
}
