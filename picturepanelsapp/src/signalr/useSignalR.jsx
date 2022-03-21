import { useContext, useEffect } from "react";
import SignalRContext from "../signalr/SignalRContext";

export function useSignalR(eventName, callback) {
  const signalRContext = useContext(SignalRContext);

  useEffect(() => {
    signalRContext.on(eventName, callback);

    return () => {
      signalRContext.off(eventName, callback);
    };
  });
}
