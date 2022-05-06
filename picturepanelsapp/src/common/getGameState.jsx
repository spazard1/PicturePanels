import serverUrl from "./ServerUrl";

export default function getGameState(gameStateId, callback) {
  fetch(serverUrl + "api/gameState/" + gameStateId)
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
