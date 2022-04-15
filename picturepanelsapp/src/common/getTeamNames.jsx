export default function getTeamNames(callback) {
  fetch("https://picturepanels.azurewebsites.net/api/teamNames")
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
