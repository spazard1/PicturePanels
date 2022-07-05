import React, { useContext, useState } from "react";
import { useEffect } from "react";
import UserContext from "../user/UserContext";
import getImagesUploadedBy from "./getImagesUploadedBy";
import serverUrl from "../common/ServerUrl";

import "./UserThumbnails.css";

const UserThumbnails = () => {
  const { userToken } = useContext(UserContext);
  const [userImages, setUserImages] = useState([]);
  const [queryString, setQueryString] = useState();

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
    <div className="thumbnailsContainer">
      {userImages.map((userImage) => (
        <div className="thumbnailContainer" key={userImage.id}>
          <img className="thumbnail" src={serverUrl + "api/images/thumbnails/" + userImage.id + "?" + queryString} />
        </div>
      ))}
    </div>
  );
};

export default UserThumbnails;
