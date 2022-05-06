import serverUrl from "./ServerUrl";

export default function getTeamNames(callback) {
  fetch(serverUrl + "api/teamNames")
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
