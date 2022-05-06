import serverUrl from "../../common/ServerUrl";

export default function getTeamGuesses(gameStateId, playerId, callback) {
  fetch(serverUrl + "api/teamGuesses/" + gameStateId + "/" + playerId + "/object")
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
