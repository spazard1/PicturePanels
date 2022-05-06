import serverUrl from "../../common/ServerUrl";

const getSmallestTeam = (gameStateId, callback) => {
  fetch(serverUrl + "api/gameState/" + gameStateId + "/smallestTeam")
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
