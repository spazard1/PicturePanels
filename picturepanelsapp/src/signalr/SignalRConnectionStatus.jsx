import React, { useContext, useEffect, useRef, useState } from "react";
import SignalRConnectionContext from "./SignalRConnectionContext";
import Button from "react-bootstrap/Button";

import "./SignalRConnectionStatus.css";

const SignalRConnectionStatus = () => {
  const { connection } = useContext(SignalRConnectionContext);
  const [connectionMessage, setConnectionMessage] = useState("");
  const [showReloadButton, setShowReloadButton] = useState(false);
  const connectionIntervalRef = useRef();
  const reconnectingCount = useRef(0);

  useEffect(() => {
    if (!connection) {
      return;
    }

    clearInterval(connectionIntervalRef.current);

    connectionIntervalRef.current = setInterval(() => {
      if (connection.state === "Connected") {
        setConnectionMessage("");
        return;
      }

      if (connection.state === "Disconnecting" || connection.state === "Disconnected") {
        clearInterval(connectionIntervalRef.current);
        setConnectionMessage("Disconnected from server.");
        setShowReloadButton(true);
        return;
      }

      if (connection.state === "Connecting" || connection.state === "Reconnecting") {
        reconnectingCount.current++;

        if (reconnectingCount.current > 4) {
          setConnectionMessage("Reconnecting to server...");
          setShowReloadButton(false);
        } else {
          setConnectionMessage("Reconnecting to server...");
          setShowReloadButton(true);
        }
        return;
      }
    }, 1000);
  }, [connection]);

  return (
    <>
      {connectionMessage && (
        <div className="signalRConnectionState center">
          {connectionMessage}
          {showReloadButton && (
            <div>
              <Button variant="warning" onClick={() => window.location.reload(false)}>
                Reload Page
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default SignalRConnectionStatus;

SignalRConnectionStatus.propTypes = {};
