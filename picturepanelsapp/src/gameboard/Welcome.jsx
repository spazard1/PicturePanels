import React from "react";
import PropTypes from "prop-types";
import serverUrl from "../common/ServerUrl";

import "./Welcome.css";

const Welcome = ({ gameStateId }) => {
  return (
    <div className="welcomeContainer">
      <div className="welcomeText">
        <div>Welcome to Picture Panels!</div>
        <div>To join the game, go to picturepanels.net on your device or scan this QR code.</div>
      </div>
      <div className="welcomeQRCodeContainer">
        <img className="welcomeQRCodeImg" src={serverUrl + "api/images/gameStateQRCode/" + gameStateId} alt="Welcome QR Code" />
      </div>
      <div className="welcomeGameCode">
        Game Code:
        <div className="welcomeGameStateId">{gameStateId}</div>
      </div>
    </div>
  );
};

export default Welcome;

Welcome.propTypes = {
  gameStateId: PropTypes.string.isRequired,
};
