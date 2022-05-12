import serverUrl from "../../common/ServerUrl";

export default function putGuessVote(gameStateId, playerId, guessId, callback) {
  fetch(serverUrl + "api/players/" + gameStateId + "/" + playerId + "/guessVote/" + guessId, {
    method: "PUT",
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
