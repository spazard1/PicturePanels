import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import ColorPicker from "./ColorPicker";
import Avatar from "../../avatars/Avatar";
import AllAvatars from "../../avatars/AllAvatars";
import { Button, Form } from "react-bootstrap";
import classNames from "classnames";
import shuffleSeed from "shuffle-seed";
import { useLocalStorageState } from "../../common/useLocalStorageState";
import { v4 as uuidv4 } from "uuid";
import Color from "color";
import dice64 from "./../../common/randomize/dice-64.png";
import { useSpinAnimation } from "../../common/randomize/useSpinAnimation";

import "./ChoosePlayerAvatar.css";

const ChoosePlayerAvatar = ({ colors, onColorChange, onColorRemove, onAvatarSelect }) => {
  const [spinAnimation, setSpinAnimation] = useSpinAnimation();
  const [selectedAvatar, setSelectedAvatar] = useLocalStorageState("playerAvatar");
  const selectedAvatarRef = useRef();
  const [startingColors, setStartingColors] = useState(colors);
  const [seed] = useLocalStorageState("seed", uuidv4());
  const colorPickerContainerRef = useRef();
  const shuffledAvatarsRef = useRef(shuffleSeed.shuffle(Object.keys(AllAvatars), seed));

  const avatarSelectOnClick = () => {
    onAvatarSelect(selectedAvatar);
  };

  const onSwapColors = () => {
    setStartingColors([colors[1], colors[0]]);
  };

  const getNewColor = () => {
    return Color("#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"));
  };

  const onRandomizeColors = () => {
    setSpinAnimation(true);

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

  useEffect(() => {
    if (selectedAvatarRef.current) {
      selectedAvatarRef.current.scrollIntoView({ block: "center" });
    }
  }, []);

  return (
    <>
      <div className="choosePlayerAvatarContainer">
        <div className="choosePlayerAvatarLabel">Choose your avatar</div>
        <div className="colorOptionsContainer">
          <div className="colorPickerContainer">
            <div className={classNames("randomizeContainer", { spinAnimation: spinAnimation })} onClick={onRandomizeColors}>
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
            <Form.Check type="switch" checked={colors && colors.length > 1} onChange={onColorCountChange} />
            <div className="swapColorsButtonContainer">
              <Button onClick={onSwapColors} disabled={colors && colors.length < 2}>
                Swap Colors
              </Button>
            </div>
          </div>
        </div>
        <div className="playerAvatars">
          {shuffledAvatarsRef.current.map((avatarName) => (
            <div key={avatarName} ref={avatarName === selectedAvatar ? selectedAvatarRef : null} onClick={() => setSelectedAvatar(avatarName)}>
              <Avatar
                avatar={avatarName}
                colors={colors}
                className={classNames("avatarChoice", { selectedAvatar: avatarName === selectedAvatar })}
              ></Avatar>
            </div>
          ))}
        </div>
        <div className="playerAvatarNextButton">
          <Button onClick={avatarSelectOnClick} disabled={!selectedAvatar}>
            Looks Good
          </Button>
        </div>
      </div>
    </>
  );
};

export default ChoosePlayerAvatar;

ChoosePlayerAvatar.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.object),
  onColorChange: PropTypes.func.isRequired,
  onColorRemove: PropTypes.func.isRequired,
  onAvatarSelect: PropTypes.func.isRequired,
};
