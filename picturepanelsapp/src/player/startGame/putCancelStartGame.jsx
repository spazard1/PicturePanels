const putCancelStartGame = (gameStateId, playerId, callback) => {
  fetch("https://picturepanels.azurewebsites.net/api/gamestate/" + gameStateId + "/" + playerId + "/cancelStart", {
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
