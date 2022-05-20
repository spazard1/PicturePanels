import React, { useState } from "react";
import PropTypes from "prop-types";
import ColorPicker from "./ColorPicker";
import AllPlayerDots from "../../playerDots/AllPlayerDots";
import "./ChoosePlayerDot.css";
import { Button } from "react-bootstrap";
import classNames from "classnames";

const ChoosePlayerDot = ({ color, onColorChange, onDotSelect }) => {
  const [selectedDot, setSelectedDot] = useState(localStorage.getItem("playerDot"));

  const dotSelectOnClick = () => {
    onDotSelect(selectedDot);
  };

  return (
    <>
      <div className="choosePlayerDotLabel">Choose a color and icon</div>
      <ColorPicker onColorChange={onColorChange}></ColorPicker>
      <div className="playerDots">
        {Object.keys(AllPlayerDots).map((dotName) => {
          const PlayerDot = AllPlayerDots[dotName];
          return (
            <div
              key={dotName}
              className={classNames("playerDot", { playerDotSelected: dotName === selectedDot })}
              onClick={() => setSelectedDot(dotName)}
            >
              <PlayerDot color={color}></PlayerDot>
            </div>
          );
        })}
      </div>
      <Button onClick={dotSelectOnClick} disabled={!selectedDot}>
        Join
      </Button>
    </>
  );
};

export default ChoosePlayerDot;

ChoosePlayerDot.propTypes = {
  color: PropTypes.string,
  onColorChange: PropTypes.func,
  onDotSelect: PropTypes.func,
};
