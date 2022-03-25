/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect } from "react";
import { CreateSignalRConnection } from "./SignalRConnectionFactory";
import SignalRConnectionContext from "./SignalRConnectionContext";

export function useSignalRConnection(queryString, ...stateDependencies) {
  const { setConnection, setConnectionId } = useContext(SignalRConnectionContext);

  useEffect(() => {
    // ensure that no dependencies are currently null
    if (!stateDependencies.some((x) => x)) {
      return;
    }

    const newConnection = CreateSignalRConnection(queryString, setConnectionId);

    setConnection(newConnection);
    setConnectionId(newConnection.id);
  }, [...stateDependencies]);
}
