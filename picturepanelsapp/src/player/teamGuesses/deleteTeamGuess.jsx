export default function deleteTeamGuess(gameStateId, playerId, ticks, callback) {
  fetch("https://picturepanels.azurewebsites.net/api/teamGuesses/" + gameStateId + "/" + playerId + "/" + ticks, {
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
