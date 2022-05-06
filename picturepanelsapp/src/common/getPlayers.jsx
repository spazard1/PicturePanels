import serverUrl from "./ServerUrl";

export default function getPlayers(gameStateId, callback) {
  fetch(serverUrl + "api/players/" + gameStateId)
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
