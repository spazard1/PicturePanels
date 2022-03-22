import { useContext, useEffect } from "react";
import SignalRConnectionContext from "./SignalRConnectionContext";

export function useSignalR(eventName, callback) {
  const { connection } = useContext(SignalRConnectionContext);

  useEffect(() => {
    if (!connection) {
      return;
    }

    connection.on(eventName, callback);

    return () => {
      connection.off(eventName, callback);
    };
  }, [connection]);
}
