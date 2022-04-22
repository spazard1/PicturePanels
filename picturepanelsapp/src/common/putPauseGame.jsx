export function putPauseGame(gameStateId, callback) {
  fetch("https://picturepanels.azurewebsites.net/api/gameState/" + gameStateId + "/pause", {
    method: "PUT",
  }).then((response) => {
    if (response.ok) {
      callback(true);
    }
    callback(false);
  });
}

export function putResumeGame(gameStateId, callback) {
  fetch("https://picturepanels.azurewebsites.net/api/gameState/" + gameStateId + "/resume", {
    method: "PUT",
  }).then((response) => {
    if (response.ok) {
      callback(true);
    }
    callback(false);
  });
}
