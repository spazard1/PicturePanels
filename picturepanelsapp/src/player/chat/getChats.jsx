export default function getChats(gameStateId, teamNumber, callback) {
  fetch("https://picturepanels.azurewebsites.net/api/chats/" + gameStateId + "/" + teamNumber)
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
