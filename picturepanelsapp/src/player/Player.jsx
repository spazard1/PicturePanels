import React from "react";
import AllLinks from "../common/AllLinks";
import { useBodyClass } from "../common/useBodyClass";
import './Player.css';

export default function Player() {
  useBodyClass("player");

  return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Player</h2>
      <AllLinks/>
    </main>
  );
}
