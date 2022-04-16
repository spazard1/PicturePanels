export default function getGameRounds(gameStateId, callback) {
  fetch("https://picturepanels.azurewebsites.net/api/gameState/gameRounds/" + gameStateId)
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
