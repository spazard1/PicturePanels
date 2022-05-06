import serverUrl from "../../common/ServerUrl";

export default function putGuess(gameStateId, playerId, guess, confidence, callback) {
  fetch(serverUrl + "api/players/" + gameStateId + "/" + playerId + "/guess", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      guess: guess,
      confidence: confidence,
    }),
  })
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
