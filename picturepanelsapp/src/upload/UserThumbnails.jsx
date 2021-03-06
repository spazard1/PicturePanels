import React, { useCallback, useContext, useState } from "react";
import { useEffect } from "react";
import UserContext from "../user/UserContext";
import getImagesUploadedBy from "./getImagesUploadedBy";
import serverUrl from "../common/ServerUrl";
import ModalEditImage from "../common/modal/ModalEditImage";
import patchImage from "./patchImage";
import classNames from "classnames";
import { useTags } from "../common/useTags";

import "./UserThumbnails.css";

const UserThumbnails = () => {
  const { userToken } = useContext(UserContext);
  const [userImages, setUserImages] = useState([]);
  const [queryString, setQueryString] = useState();
  const [editingImage, setEditingImage] = useState();
  const [savingImageId, setSavingImageId] = useState();
  const { whitelistTags, tagifySettings, decorateSortOrder } = useTags();

  const onClickEditImage = useCallback((userImage) => {
    setEditingImage(userImage);
  }, []);

  const onModalClose = useCallback(() => {
    setEditingImage();
  }, []);

  const onEditImage = useCallback(
    (editForm) => {
      setEditingImage();
      setSavingImageId(editingImage.id);

      patchImage(editForm, editingImage.id, (result) => {
        setSavingImageId();
        if (result) {
          const newUserImages = [...userImages];
          for (let i = 0; i < newUserImages.length; i++) {
            if (newUserImages[i].id === editingImage.id) {
              newUserImages[i] = result;
              break;
            }
          }
          setUserImages(newUserImages);
        }
      });
    },
    [userImages, editingImage]
  );

  useEffect(() => {
    if (!userToken) {
      return;
    }

    getImagesUploadedBy((result) => {
      if (result) {
        setUserImages(result.images);
        setQueryString(result.queryString);
      }
    });
  }, [userToken]);

  return (
    <>
      {editingImage && (
        <ModalEditImage
          imageDetails={editingImage}
          onEditImage={onEditImage}
          onModalClose={onModalClose}
          whitelistTags={whitelistTags}
          tagifySettings={tagifySettings}
          decorateSortOrder={decorateSortOrder}
        />
      )}
      <div className="thumbnailsContainer">
        {userImages.map((userImage) => (
          <div
            className={classNames("thumbnailContainer", "animate__animated", "animate__infinite", {
              animate__bounce: userImage.id === savingImageId,
            })}
            key={userImage.id}
            onClick={() => onClickEditImage(userImage)}
          >
            <img className="thumbnail" src={serverUrl + "api/images/thumbnails/" + userImage.id + "?" + queryString} />
            <div>{userImage.name}</div>
            <div className="imageTags">
              {decorateSortOrder(userImage.tags).map((tag) => (
                <div className="imageTag" key={tag.value} data-sortorder={tag["data-sortorder"]}>
                  {tag.value}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default UserThumbnails;
