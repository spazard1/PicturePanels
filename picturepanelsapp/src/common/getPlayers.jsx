export default function getPlayers(gameStateId, callback) {
  fetch("https://picturepanels.azurewebsites.net/api/players/" + gameStateId)
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
