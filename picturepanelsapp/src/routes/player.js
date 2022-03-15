import React, { useEffect } from "react";

export default function Player() {

    useEffect(() => {
        document.title = "Picture Panels";
    }, []);

    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>Player</h2>
      </main>
    );
  }
