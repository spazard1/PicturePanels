import serverUrl from "../common/ServerUrl";

export function putEndRound(gameStateId, callback) {
  fetch(serverUrl + "api/gameState/" + gameStateId + "/endRound", {
    method: "PUT",
  }).then((response) => {
    if (response.ok) {
      callback(true);
    }
    callback(false);
  });
}
