import React, { useState } from "react";
import PropTypes from "prop-types";
import SignalRConnectionContext from "../signalr/SignalRConnectionContext";
import UserContext from "../user/UserContext";

export default function AppWrapper({ children }) {
  const [connection, setConnection] = useState();
  const [connectionId, setConnectionId] = useState();
  const [user, setUser] = useState();

  return (
    <UserContext.Provider value={{ user: user, setUser: setUser }}>
      <SignalRConnectionContext.Provider value={{ connection, setConnection, connectionId, setConnectionId }}>
        {children}
      </SignalRConnectionContext.Provider>
    </UserContext.Provider>
  );
}

AppWrapper.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};
