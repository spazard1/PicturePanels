import serverUrl from "../../common/ServerUrl";

export default function putOk(gameStateId, playerId, callback) {
  fetch(serverUrl + "api/players/" + gameStateId + "/" + playerId + "/ok", {
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
