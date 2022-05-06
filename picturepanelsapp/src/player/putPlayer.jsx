import serverUrl from "../common/ServerUrl";

const putPlayer = (gameStateId, playerOptions, callback) => {
  fetch(serverUrl + "api/players/" + gameStateId, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(playerOptions),
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

export default putPlayer;
