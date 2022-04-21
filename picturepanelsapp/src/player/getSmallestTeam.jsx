const getSmallestTeam = (gameStateId, callback) => {
  return fetch("https://picturepanels.azurewebsitse.net/api/gameState/" + gameStateId + "/smallestTeam").then((response) => {
    if (response.ok) {
      callback(response.json());
    }
    callback(false);
  });
};

export default getSmallestTeam;
