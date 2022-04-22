const getPlayer = (gameStateId, playerId, callback) => {
  fetch("https://picturepanels.azurewebsites.net/api/players/" + gameStateId + "/" + playerId)
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
