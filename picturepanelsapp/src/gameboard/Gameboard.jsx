import React, { useEffect, useState } from "react";
import AllLinks from "../common/AllLinks";
import { useBodyClass } from "../common/useBodyClass";
import "./Gameboard.css";

export default function Gameboard() {
  const { x, setX } = useState();
  useBodyClass("gameboard");

  useEffect(() => {
    if (x === 4) {
      setX(3);
    }
  }, []);

  return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Gameboard</h2>
      <AllLinks />
    </main>
  );
}
