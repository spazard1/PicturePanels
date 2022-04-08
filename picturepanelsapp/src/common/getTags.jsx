export default function getTags(callback) {
  fetch("https://picturepanels.azurewebsites.net/api/images/tags")
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
