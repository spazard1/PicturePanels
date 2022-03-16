import React, { useEffect } from "react";
import { Link } from "react-router-dom";

export default function Player() {

    useEffect(() => {
        document.title = "Picture Panels";
    }, []);

    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>Player</h2>
        <Link to="/gameboard">Gameboard</Link>
      </main>
    );
  }
