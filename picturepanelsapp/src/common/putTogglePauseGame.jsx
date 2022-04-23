export function putTogglePauseGame(gameStateId, callback) {
  fetch("https://picturepanels.azurewebsites.net/api/gameState/" + gameStateId + "/togglePause", {
    method: "PUT",
  }).then((response) => {
    if (response.ok) {
      callback(true);
    }
    callback(false);
  });
}
