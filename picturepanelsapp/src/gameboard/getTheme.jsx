import serverUrl from "../common/ServerUrl";

export default function getTheme(gameStateId, callback) {
  fetch(serverUrl + "api/themes/" + gameStateId)
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
