let serverUrl = "https://picturepanels.azurewebsites.net/";

if (window.location.host.indexOf("localhost") >= 0) {
  serverUrl = "https://localhost:59817/";
}

export default serverUrl;
