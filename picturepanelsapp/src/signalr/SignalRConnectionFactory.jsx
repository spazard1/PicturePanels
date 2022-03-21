import * as signalr from "@microsoft/signalr";

export const CreateSignalRConnection = (queryString) => {
  return new signalr.HubConnectionBuilder()
    .withUrl(
      "https://picturepanels.azurewebsites.net/signalRHub?" + queryString
    )
    .withAutomaticReconnect()
    .configureLogging(signalr.LogLevel.Information)
    .build();
};
