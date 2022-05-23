import serverUrl from "../common/ServerUrl";

const putPlayerResume = (gameStateId, playerId, callback) => {
  fetch(serverUrl + "api/players/" + gameStateId + "/" + playerId, {
    method: "PUT",
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      return false;
    })
    .then((responseJson) => {
      if (callback) {
        callback(responseJson);
      }
    });
};

export default putPlayerResume;
