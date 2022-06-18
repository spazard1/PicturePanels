import serverUrl from "../common/ServerUrl";

const getPlayer = (gameStateId, playerId, callback) => {
  return fetch(serverUrl + "api/players/" + gameStateId + "/" + playerId)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      return false;
    })
    .then((responseJson) => {
      callback(responseJson);
    });
};

export default getPlayer;
