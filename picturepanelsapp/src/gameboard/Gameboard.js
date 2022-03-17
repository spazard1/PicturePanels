import React, { useEffect } from "react";
import AllLinks from "../Common/AllLinks";
import './Gameboard.css';

export default function Gameboard() {
    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>Gameboard</h2>
        <AllLinks/>
      </main>
    );
  }
