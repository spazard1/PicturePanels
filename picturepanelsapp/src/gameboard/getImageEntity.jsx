import serverUrl from "../common/ServerUrl";

export function getImageEntity(gameStateId, callback) {
  return fetch(serverUrl + "api/images/entity/" + gameStateId)
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
