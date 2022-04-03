import * as signalR from "@microsoft/signalr";

export const CreateSignalRConnection = (queryString, setConnection, setConnectionId) => {
  var connection = new signalR.HubConnectionBuilder()
    .withUrl("https://picturepanels.azurewebsites.net/signalRHub?" + queryString)
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

  connection.onreconnecting((error) => {
    // console.assert(connection.state === signalR.HubConnectionState.Reconnecting);
    console.error(error);

    //const li = document.createElement("li");
    //li.textContent = `Connection lost due to error "${error}". Reconnecting.`;
    //document.getElementById("messageList").appendChild(li);
  });

  connection.onreconnected((connectionId) => {
    console.log("signalr reconnected");
    setConnectionId(connectionId);
  });

  connection.start().then(() => {
    setConnection(connection);
    setConnectionId(connection.id);
  });

  return connection;
};
