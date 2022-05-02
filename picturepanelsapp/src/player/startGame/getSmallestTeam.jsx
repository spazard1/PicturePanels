const getSmallestTeam = (gameStateId, callback) => {
  fetch("https://picturepanels.azurewebsites.net/api/gameState/" + gameStateId + "/smallestTeam")
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      callback(false);
    })
    .then((responseJson) => {
      callback(responseJson);
    });
};

export default getSmallestTeam;
