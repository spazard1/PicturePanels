export function getImageEntity(gameStateId, callback) {
  return fetch("https://picturepanels.azurewebsites.net/api/images/entity/" + gameStateId)
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
