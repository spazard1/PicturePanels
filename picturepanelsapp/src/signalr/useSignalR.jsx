import { useContext, useEffect } from "react";
import SignalRContext from "../signalr/SignalRContext";

export function useSignalR(eventName, callback) {
  const signalRContext = useContext(SignalRContext);

  useEffect(() => {
    if (!signalRContext) {
      return;
    }

    signalRContext.on(eventName, callback);

    return () => {
      signalRContext.off(eventName, callback);
    };
  }, [signalRContext]);
}
