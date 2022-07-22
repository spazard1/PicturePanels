import React, { useState } from "react";
import PropTypes from "prop-types";
import SignalRConnectionContext from "../signalr/SignalRConnectionContext";
import LoginManager from "./LoginManager";
import ModalManager from "./modal/ModalManager";

export default function AppWrapper({ children }) {
  const [connection, setConnection] = useState();
  const [connectionId, setConnectionId] = useState();

  return (
    <ModalManager>
      <LoginManager>
        <SignalRConnectionContext.Provider value={{ connection, setConnection, connectionId, setConnectionId }}>
          {children}
        </SignalRConnectionContext.Provider>
      </LoginManager>
    </ModalManager>
  );
}

AppWrapper.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};
