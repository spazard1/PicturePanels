import serverUrl from "../common/ServerUrl";

export function getCorrectGuessPlayers(gameStateId, callback) {
  return fetch(serverUrl + "api/teamGuesses/" + gameStateId + "/correctGuessPlayers")
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
