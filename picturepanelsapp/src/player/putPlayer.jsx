export default function putPlayer(gameStateId, playerOptions, callback) {
  fetch("https://picturepanels.azurewebsites.net/api/players/" + gameStateId, {
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
}
