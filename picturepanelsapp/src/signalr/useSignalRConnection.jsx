/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState } from "react";
import { CreateSignalRConnection } from "./CreateSignalRConnection";
import SignalRConnectionContext from "./SignalRConnectionContext";

export function useSignalRConnection() {
  const { setConnection, setConnectionId } = useContext(SignalRConnectionContext);
  const [queryString, setQueryString] = useState();

  useEffect(() => {
    if (!queryString) {
      return;
    }

    CreateSignalRConnection(queryString, setConnection, setConnectionId);
  }, [queryString]);

  return { queryString, setQueryString };
}
