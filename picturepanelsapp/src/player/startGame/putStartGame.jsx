const putStartGame = (gameStateId, playerId, callback) => {
  fetch("https://picturepanels.azurewebsites.net/api/gamestate/" + gameStateId + "/" + playerId + "/start", {
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
