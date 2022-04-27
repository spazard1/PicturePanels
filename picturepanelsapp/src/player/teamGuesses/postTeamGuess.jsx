export default function postTeamGuess(gameStateId, playerId, guess, callback) {
  fetch("https://picturepanels.azurewebsites.net/api/teamGuesses/" + gameStateId + "/" + playerId, {
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
