import serverUrl from "./ServerUrl";

export default function getWhitelistTags(callback) {
  fetch(serverUrl + "api/images/whitelistTags")
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
