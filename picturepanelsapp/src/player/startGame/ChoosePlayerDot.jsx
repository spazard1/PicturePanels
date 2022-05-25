import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import ColorPicker from "./ColorPicker";
import AllPlayerDots from "../../playerDots/AllPlayerDots";
import { Button, Form } from "react-bootstrap";
import classNames from "classnames";
import shuffleSeed from "shuffle-seed";
import { useLocalStorageState } from "../../common/useLocalStorageState";
import { v4 as uuidv4 } from "uuid";
import dice64 from "./dice-64.png";
import "./ChoosePlayerDot.css";

const ChoosePlayerDot = ({ colors, onColorChange, onColorRemove, onDotSelect }) => {
  const [selectedDot, setSelectedDot] = useState(localStorage.getItem("playerDot"));
  const [randomizeSpin, setRandomizeSpin] = useState(false);
  const [startingColors, setStartingColors] = useState(colors);
  const [seed] = useLocalStorageState("seed", uuidv4());
  const colorPickerContainerRef = useRef();
  const shuffledDotsRef = useRef(shuffleSeed.shuffle(Object.keys(AllPlayerDots), seed));

  const dotSelectOnClick = () => {
    onDotSelect(selectedDot);
  };

  const onSwapColors = () => {
    setStartingColors([colors[1], colors[0]]);
  };

  const getNewColor = () => {
    return "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");
  };

  const onRandomizeColors = () => {
    setRandomizeSpin(true);
    setTimeout(() => {
      setRandomizeSpin(false);
    }, 250);

    if (colors.length === 1) {
      setStartingColors([getNewColor()]);
    } else {
      setStartingColors([getNewColor(), getNewColor()]);
    }
  };

  const onColorCountChange = (e) => {
    if (e.target.checked) {
      setStartingColors([colors[0], getNewColor()]);
    } else {
      setStartingColors([colors[0]]);
    }
  };

  useEffect(() => {
    if (colors.length === 0) {
      setStartingColors([getNewColor()]);
    }
  }, [colors]);

  return (
    <>
      <div className="choosePlayerDotContainer">
        <div className="choosePlayerDotLabel">Choose your avatar</div>
        <div className="colorOptionsContainer">
          <div className="colorPickerContainer">
            <div className={classNames("randomizeContainer", { randomizeContainerSpin: randomizeSpin })} onClick={onRandomizeColors}>
              <img src={dice64} alt="randomize"></img>
            </div>
            <ColorPicker
              startingColors={startingColors}
              colors={colors}
              onColorChange={onColorChange}
              onColorRemove={onColorRemove}
              colorPickerContainerRef={colorPickerContainerRef}
            ></ColorPicker>
          </div>
          <div ref={colorPickerContainerRef} className="twoColorModeContainer">
            <div>Two Color Mode</div>
            <Form.Check type="switch" id="custom-switch" checked={colors && colors.length > 1} onChange={onColorCountChange} />
            <div className="swapColorsButtonContainer">
              <Button onClick={onSwapColors} disabled={colors.length < 2}>
                Swap Colors
              </Button>
            </div>
          </div>
        </div>
        <div className="playerDots">
          {shuffledDotsRef.current.map((dotName) => {
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
            Looks Good
          </Button>
        </div>
      </div>
    </>
  );
};

export default ChoosePlayerDot;

ChoosePlayerDot.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.string),
  onColorChange: PropTypes.func.isRequired,
  onColorRemove: PropTypes.func.isRequired,
  onDotSelect: PropTypes.func.isRequired,
};
