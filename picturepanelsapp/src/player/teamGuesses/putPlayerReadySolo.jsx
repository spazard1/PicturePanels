export default function putPlayerReadySolo(gameStateId, playerId, callback) {
  fetch("https://picturepanels.azurewebsites.net/api/players/" + gameStateId + "/" + playerId + "/readySolo", {
    method: "PUT",
  })
    .then((response) => {
      if (response.ok) {
        return true;
      }
      return false;
    })
    .then((responseJson) => {
      callback(responseJson);
    });
}
