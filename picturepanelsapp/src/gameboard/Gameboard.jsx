import React from "react";
import AllLinks from "../common/AllLinks";
import { useBodyClass } from "../common/useBodyClass";
import SignalRContext from "../signalr/SignalRContext";
import { CreateSignalRConnection } from "../signalr/SignalRConnectionFactory";
import Panels from "./Panels";
import "./Gameboard.css";
import "animate.css";

export default function Gameboard() {
  useBodyClass("gameboard");

  const signalRContext = CreateSignalRConnection(
    "gameStateId=" + localStorage.getItem("gameStateId")
  );

  // const [gameStateId, setGameStateId] = useState();

  return (
    <SignalRContext.Provider value={signalRContext}>
      <AllLinks />
      <Panels />
    </SignalRContext.Provider>
  );
}
