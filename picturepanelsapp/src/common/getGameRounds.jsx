import serverUrl from "./ServerUrl";

export default function getGameRounds(gameStateId, callback) {
  fetch(serverUrl + "api/gameState/gameRounds/" + gameStateId)
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
