export default function putTeamGuessVote(gameStateId, playerId, ticks, callback) {
  fetch("https://picturepanels.azurewebsites.net/api/teamGuesses/" + gameStateId + "/" + playerId + "/" + ticks, {
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
