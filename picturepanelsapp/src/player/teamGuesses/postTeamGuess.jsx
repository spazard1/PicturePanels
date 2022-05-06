import serverUrl from "../../common/ServerUrl";

export default function postTeamGuess(gameStateId, playerId, guess, callback) {
  fetch(serverUrl + "api/teamGuesses/" + gameStateId + "/" + playerId, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ guess }),
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
