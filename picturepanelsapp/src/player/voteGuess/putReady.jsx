import serverUrl from "../../common/ServerUrl";

export default function putReady(gameStateId, playerId, callback) {
  fetch(serverUrl + "api/players/" + gameStateId + "/" + playerId + "/ready", {
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
