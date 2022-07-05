import serverUrl from "../common/ServerUrl";

export default function getImagesUploadedBy(callback) {
  fetch(serverUrl + "api/images/uploadedBy", {
    method: "GET",
    headers: {
      Authorization: localStorage.getItem("userToken"),
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      return false;
    })
    .then((responseJson) => {
      callback(responseJson);
    });
}
