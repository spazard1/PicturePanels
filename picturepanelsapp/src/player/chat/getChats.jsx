import serverUrl from "../../common/ServerUrl";

export default function getChats(gameStateId, teamNumber, callback) {
  fetch(serverUrl + "api/chats/" + gameStateId + "/" + teamNumber)
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
