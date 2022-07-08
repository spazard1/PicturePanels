import serverUrl from "../common/ServerUrl";

export default function postImage(cropperData, imageId, callback) {
  fetch(serverUrl + "api/images/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("userToken"),
    },
    body: JSON.stringify({
      ...cropperData,
      imageId,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        return false;
      }
      return response.json();
    })
    .then((imageEntity) => {
      callback(imageEntity);
    })
    .catch(() => {
      callback(false);
    });
}
