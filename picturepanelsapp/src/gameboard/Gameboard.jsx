import React from "react";
import AllLinks from "../common/AllLinks";
import { useBodyClass } from "../common/useBodyClass";
import "./Gameboard.css";

export default function Gameboard() {
  useBodyClass("gameboard");

  return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Gameboard</h2>
      <AllLinks />
    </main>
  );
}
