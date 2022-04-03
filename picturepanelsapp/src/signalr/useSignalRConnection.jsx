/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect } from "react";
import { CreateSignalRConnection } from "./CreateSignalRConnection";
import SignalRConnectionContext from "./SignalRConnectionContext";

export function useSignalRConnection(queryString, ...stateDependencies) {
  const { setConnection, setConnectionId } = useContext(SignalRConnectionContext);

  useEffect(() => {
    // ensure that no dependencies are currently null
    if (!stateDependencies.some((x) => x)) {
      return;
    }

    CreateSignalRConnection(queryString, setConnection, setConnectionId);
  }, [...stateDependencies]);
}
