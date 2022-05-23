import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import ColorPicker from "./ColorPicker";
import AllPlayerDots from "../../playerDots/AllPlayerDots";
import "./ChoosePlayerDot.css";
import { Button, Form } from "react-bootstrap";
import classNames from "classnames";

const ChoosePlayerDot = ({ colors, onColorChange, onColorCountChange, onDotSelect }) => {
  const [selectedDot, setSelectedDot] = useState(localStorage.getItem("playerDot"));
  const [startingColors, setStartingColors] = useState(colors);
  const colorPickerContainerRef = useRef();

  const dotSelectOnClick = () => {
    onDotSelect(selectedDot);
  };

  const onSwapColors = () => {
    setStartingColors([colors[1], colors[0]]);
  };

  return (
    <>
      <div className="choosePlayerDotContainer">
        <div className="choosePlayerDotLabel">Choose a color and icon</div>
        <div className="colorPickerContainer">
          <ColorPicker
            startingColors={startingColors}
            colors={colors}
            onColorChange={onColorChange}
            colorPickerContainerRef={colorPickerContainerRef}
          ></ColorPicker>
          <div ref={colorPickerContainerRef} className="twoColorModeContainer">
            <div>Two Color Mode</div>
            <Form.Check type="switch" id="custom-switch" checked={colors && colors.length > 1} onChange={onColorCountChange} />
            <div>
              <Button onClick={onSwapColors} disabled={colors.length < 2}>
                Swap Colors
              </Button>
            </div>
          </div>
        </div>
        <div className="playerDots">
          {Object.keys(AllPlayerDots).map((dotName) => {
            const PlayerDot = AllPlayerDots[dotName];
            return (
              <div
                key={dotName}
                className={classNames("playerDot", { playerDotSelected: dotName === selectedDot })}
                onClick={() => setSelectedDot(dotName)}
              >
                <PlayerDot colors={colors}></PlayerDot>
              </div>
            );
          })}
        </div>
        <div className="playerDotNextButton">
          <Button onClick={dotSelectOnClick} disabled={!selectedDot}>
            Join
          </Button>
        </div>
      </div>
    </>
  );
};

export default ChoosePlayerDot;

ChoosePlayerDot.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.string),
  onColorChange: PropTypes.func,
  onColorCountChange: PropTypes.func,
  onDotSelect: PropTypes.func,
};
