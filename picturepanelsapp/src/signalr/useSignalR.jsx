import { useContext, useEffect } from "react";
import SignalRContext from "../signalr/SignalRContext";

export function useSignalR(eventName, callback) {
  const connection = useContext(SignalRContext);

  useEffect(() => {
    console.log("setting up callback " + connection);

    if (!connection) {
      return;
    }

    console.log("setting up callback " + connection);

    connection.on(eventName, callback);

    return () => {
      connection.off(eventName, callback);
    };
  }, [connection]);
}
