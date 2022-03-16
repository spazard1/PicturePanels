import { Link } from "react-router-dom";

export default function Gameboard() {
    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>Gameboard</h2>
        <Link to="/">Player</Link>
      </main>
    );
  }