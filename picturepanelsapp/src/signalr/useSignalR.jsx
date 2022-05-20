import { useContext, useEffect } from "react";
import SignalRConnectionContext from "./SignalRConnectionContext";

export function useSignalR(eventName, callback) {
  const { connection, connectionId } = useContext(SignalRConnectionContext);

  useEffect(() => {
    if (!connection) {
      return;
    }

    connection.on(eventName, callback);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection]);

  useEffect(() => {
    if (!connection) {
      return;
    }

    return () => {
      connection.off(eventName, callback);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return connectionId;
}
