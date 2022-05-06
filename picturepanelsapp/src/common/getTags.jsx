import serverUrl from "./ServerUrl";

export default function getTags(callback) {
  fetch(serverUrl + "api/images/tags")
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
