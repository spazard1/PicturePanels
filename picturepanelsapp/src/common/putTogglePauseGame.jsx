import serverUrl from "./ServerUrl";

export function putTogglePauseGame(gameStateId, callback) {
  fetch(serverUrl + "api/gameState/" + gameStateId + "/togglePause", {
    method: "PUT",
  }).then((response) => {
    if (response.ok) {
      callback(true);
    }
    callback(false);
  });
}
