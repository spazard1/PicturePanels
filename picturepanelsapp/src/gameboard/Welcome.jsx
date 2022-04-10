import React from "react";
import PropTypes from "prop-types";

import "./Welcome.css";

const Welcome = ({ gameStateId }) => {
  return (
    <div className="welcomeContainer">
      <div className="welcomeText">
        Welcome to Picture Panels!
        <br />
        To join the game, go to picturepanels.net on your device or scan this QR code.
      </div>
      <div className="welcomeQRCodeContainer">
        <img
          className="welcomeQRCodeImg"
          src={"https://picturepanels.azurewebsites.net/api/images/gameStateQRCode/" + gameStateId}
          alt="Welcome QR Code"
        />
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
