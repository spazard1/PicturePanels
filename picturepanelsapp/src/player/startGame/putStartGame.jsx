import serverUrl from "../../common/ServerUrl";

const putStartGame = (gameStateId, playerId, callback) => {
  fetch(serverUrl + "api/gamestate/" + gameStateId + "/" + playerId + "/start", {
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

export default putStartGame;
