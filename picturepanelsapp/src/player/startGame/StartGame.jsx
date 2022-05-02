import React from "react";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";

const StartGame = ({ turnEndTime }) => {
  return (
    <>
      <div className="teamButtons">
        {!turnEndTime && <Button variant="success">Start the Game!</Button>}
        {turnEndTime && <Button variant="secondary">Cancel Game Start</Button>}
      </div>
      {turnEndTime && <div>Game starts in {10}...</div>}
    </>
  );
};

export default StartGame;

StartGame.propTypes = {
  turnEndTime: PropTypes.string,
};
