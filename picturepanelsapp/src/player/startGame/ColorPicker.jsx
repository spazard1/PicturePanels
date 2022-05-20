import React, { useEffect } from "react";
import PropTypes from "prop-types";
import iro from "@jaames/iro";

const ColorPicker = ({ onColorChange }) => {
  useEffect(() => {
    let initialColor = "hsl(" + Math.ceil(Math.random() * 360) + ", 100%, 50%)";

    if (localStorage.getItem("playerColor")) {
      initialColor = localStorage.getItem("playerColor");
    }

    let colorPicker = new iro.ColorPicker("#colorPicker", {
      layout: [
        {
          component: iro.ui.Wheel,
          options: {},
        },
      ],
      color: initialColor,
      width: Math.ceil(Math.min(200, window.screen.width * 0.5)),
    });

    colorPicker.on("color:change", function (color) {
      color.value = 100;
      onColorChange(color.hslString);
    });
  }, [onColorChange]);

  return <div id="colorPicker" className="colorPicker center"></div>;
};

export default ColorPicker;

ColorPicker.propTypes = {
  onColorChange: PropTypes.func.isRequired,
};
