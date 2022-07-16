import serverUrl from "../common/ServerUrl";

const postUploadTemporary = (toUpload, callback) => {
  if (typeof toUpload === "string") {
    uploadTemporaryUrl(toUpload, callback);
  } else {
    uploadTemporaryBlob(toUpload, callback);
  }
};

export default postUploadTemporary;

export const uploadTemporaryUrl = (uploadUrl, callback) => {
  fetch(serverUrl + "api/images/uploadTemporaryUrl", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("userToken"),
    },
    body: JSON.stringify({
      url: uploadUrl,
    }),
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    })
    .then((responseJson) => {
      callback(responseJson);
    })
    .catch(function () {
      callback(false);
    });
};

export const uploadTemporaryBlob = (blob, callback) => {
  fetch(serverUrl + "api/images/uploadTemporaryBlob", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("userToken"),
    },
    body: blob,
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    })
    .then((responseJson) => {
      callback(responseJson);
    })
    .catch(function () {
      callback(false);
    });
};
