import React, { useState } from "react";
import PropTypes from "prop-types";
import SignalRConnectionContext from "../signalr/SignalRConnectionContext";

export default function AppWrapper({ children }) {
  const [connection, setConnection] = useState();
  const [connectionId, setConnectionId] = useState();

  return (
    <SignalRConnectionContext.Provider value={{ connection, setConnection, connectionId, setConnectionId }}>
      {children}
    </SignalRConnectionContext.Provider>
  );
}

AppWrapper.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};
