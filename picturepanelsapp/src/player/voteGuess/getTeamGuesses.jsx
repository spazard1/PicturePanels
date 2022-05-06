export default function getTeamGuesses(gameStateId, playerId, callback) {
  fetch("https://picturepanels.azurewebsites.net/api/teamGuesses/" + gameStateId + "/" + playerId + "/object")
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
