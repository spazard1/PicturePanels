export default function getGameState(gameStateId, callback) {
  fetch("https://picturepanels.azurewebsites.net/api/gameState/" + gameStateId)
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
