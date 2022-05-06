import serverUrl from "../../common/ServerUrl";

const putCancelStartGame = (gameStateId, playerId, callback) => {
  fetch(serverUrl + "api/gamestate/" + gameStateId + "/" + playerId + "/cancelStart", {
    method: "PUT",
  })
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

export default putCancelStartGame;
