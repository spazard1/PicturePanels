import serverUrl from "../common/ServerUrl";

export default function patchImage(formValues, imageId, callback) {
  fetch(serverUrl + "api/images/" + imageId, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("userToken"),
    },
    body: JSON.stringify(formValues),
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
