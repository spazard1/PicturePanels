import * as signalR from "@microsoft/signalr";

export const CreateSignalRConnection = (queryString, setConnectionId) => {
  console.log("new signalr connection");

  var connection = new signalR.HubConnectionBuilder()
    .withUrl(
      "https://picturepanels.azurewebsites.net/signalRHub?" + queryString
    )
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

  connection.onreconnecting((error) => {
    // console.assert(connection.state === signalR.HubConnectionState.Reconnecting);
    console.error(error);

    //const li = document.createElement("li");
    //li.textContent = `Connection lost due to error "${error}". Reconnecting.`;
    //document.getElementById("messageList").appendChild(li);

    setConnectionId(connection.id);
  });

  connection.onreconnected((connectionId) => {
    console.log("signalr reconnected");
    setConnectionId(connectionId);
  });

  connection.start();

  return connection;
};
