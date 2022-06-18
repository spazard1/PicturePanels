import serverUrl from "../../common/ServerUrl";

export default function postGameState(gameOptions, callback) {
  fetch(serverUrl + "api/gameState/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("userToken"),
    },
    body: JSON.stringify(gameOptions),
  })
    .then((response) => {
      if (response.ok || response.status === 400) {
        return response.json();
      }
      return false;
    })
    .then((responseJson) => {
      callback(responseJson);
    })
    .catch(() => {
      callback(false);
    });
}
