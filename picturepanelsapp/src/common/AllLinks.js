import React from "react";
import { Link } from "react-router-dom";

export default function AllLinks() {
    return (
        <>
            <div><Link to="/">Player</Link></div>
            <div><Link to="/gameboard">Gameboard</Link></div>
            <div><Link to="/upload">Upload</Link></div>
            <div><Link to="/admin">Admin</Link></div>
        </>
    );
  }
