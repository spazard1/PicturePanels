import serverUrl from "../../common/ServerUrl";

export default function deleteTeamGuess(gameStateId, playerId, ticks, callback) {
  fetch(serverUrl + "api/teamGuesses/" + gameStateId + "/" + playerId + "/" + ticks, {
    method: "DELETE",
  })
    .then((response) => {
      if (response.ok) {
        return true;
      }
      return false;
    })
    .then((responseJson) => {
      callback(responseJson);
    });
}
