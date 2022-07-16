import serverUrl from "../../common/ServerUrl";

const getAvatars = (gameStateId, callback) => {
  fetch(serverUrl + "api/players/" + gameStateId + "/avatars")
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

export default getAvatars;
