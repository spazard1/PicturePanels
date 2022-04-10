export default function postGameState(gameOptions, callback) {
  fetch("https://picturepanels.azurewebsites.net/api/gameState/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("userToken"),
    },
    body: JSON.stringify(gameOptions),
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
}
