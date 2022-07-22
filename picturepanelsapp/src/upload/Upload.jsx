import React, { useCallback, useContext, useEffect, useState } from "react";
import UserContext from "../user/UserContext";
import { useBodyClass } from "../common/useBodyClass";
import ChooseImage from "./ChooseImage";
import CropImage from "./CropImage";
import SetImageInfo from "./SetImageInfo";
import FinishedImage from "./FinishedImage";
import postImage from "./postImage";
import ModalContext from "../common/modal/ModalContext";
import UploadUserLogin from "./UploadUserLogin";
import putImage from "./putImage";
import { Toast, ToastContainer } from "react-bootstrap";
import postUploadTemporary from "./postUploadTemporary";
import LoadingRing from "../common/LoadingRing";

import "./Upload.css";
import "animate.css";
import "../animate/animate.css";

export default function Upload() {
  const { user } = useContext(UserContext);
  const [uploadStep, setUploadStep] = useState("ChooseImage");
  const [imageUrl, setImageUrl] = useState();
  const [imageId, setImageId] = useState();
  const [imageDetails, setImageDetails] = useState();
  const [loadingMessage, setLoadingMessage] = useState();
  const { setModalMessage, setModalConfirmMessage, modalConfirmResponse } = useContext(ModalContext);

  useBodyClass("upload");

  const onStartOver = useCallback(() => {
    setModalConfirmMessage("Are you sure you want to start over?");
  }, [setModalConfirmMessage]);

  useEffect(() => {
    if (modalConfirmResponse) {
      setImageId();
      setImageUrl();
      setImageDetails();
      setUploadStep("ChooseImage");
    }
  }, [modalConfirmResponse]);

  const onStartOverAfterFinished = useCallback(() => {
    setImageId();
    setImageUrl();
    setImageDetails();
    setUploadStep("ChooseImage");
  }, []);

  const onImageChosen = useCallback(
    (toUpload) => {
      setLoadingMessage("Uploading image...");

      postUploadTemporary(toUpload, (imageDetails) => {
        setLoadingMessage();

        if (imageDetails) {
          setImageUrl(imageDetails.url);
          setImageId(imageDetails.imageId);
          setUploadStep("CropImage");
        } else {
          setModalMessage("Could not load an image from that source.");
        }
      });
    },
    [setModalMessage]
  );

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
        } else {
          setModalMessage("Failed to crop the image. Try starting over.");
        }
      });
    },
    [setModalMessage, imageId]
  );

  const onSaveImage = useCallback(
    (imageInfo) => {
      setLoadingMessage("Saving image details...");

      console.log(imageInfo);

      putImage(imageInfo, imageId, (ids) => {
        setLoadingMessage();
        if (ids) {
          setImageDetails(ids);
          setUploadStep("FinishedImage");
        } else {
          setModalMessage("Failed to save the image. Try starting over.");
        }
      });
    },
    [setModalMessage, imageId]
  );

  return (
    <>
      <ToastContainer position={"middle-center"}>
        <Toast className="uploadLoadingToast" show={!!loadingMessage} bg="info">
          <LoadingRing message={loadingMessage} />
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
            {uploadStep === "FinishedImage" && <FinishedImage imageDetails={imageDetails} onStartOver={onStartOverAfterFinished} />}
          </>
        )}
      </div>
    </>
  );
}
