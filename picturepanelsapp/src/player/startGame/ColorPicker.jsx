import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import iro from "@jaames/iro";

const ColorPicker = ({ startingColors, colors, onColorChange, onColorRemove, colorPickerContainerRef }) => {
  const colorPickerRef = useRef();

  useEffect(() => {
    if (!startingColors || colorPickerRef.current) {
      return;
    }

    colorPickerRef.current = new iro.ColorPicker("#colorPicker", {
      layout: [
        {
          component: iro.ui.Wheel,
          options: {},
        },
        {
          component: iro.ui.Slider,
          options: {
            sliderType: "value",
          },
        },
      ],
      colors: startingColors.map((sc) => sc.hex()),
      width: colorPickerContainerRef.current.getBoundingClientRect().width,
      // layoutDirection: "horizontal",
      borderWidth: 2,
      handleRadius: 10,
      wheelLightness: false,
    });

    colorPickerRef.current.on(["color:init", "color:change"], function (color) {
      if (color.value < 1) {
        color.value = 1;
      }
      onColorChange(color.hsv, color.index);
    });

    colorPickerRef.current.on(["color:remove"], function () {
      onColorRemove();
    });
  }, [startingColors, onColorChange, onColorRemove, colorPickerContainerRef]);

  useEffect(() => {
    if (!colorPickerRef.current || colorPickerRef.current.colors.length === 0 || !startingColors || startingColors.length === 0) {
      return;
    }

    if (colorPickerRef.current.colors.length < startingColors.length) {
      colorPickerRef.current.addColor(startingColors[1]);
    } else if (colorPickerRef.current.colors.length > startingColors.length) {
      colorPickerRef.current.removeColor(1);
    }
    colorPickerRef.current.setColors(startingColors.map((sc) => sc.hex()));
  }, [colorPickerRef, startingColors]);

  useEffect(() => {
    if (colors.length === 0 || !colorPickerRef.current) {
      return;
    }

    if (colorPickerRef.current.colors.length < colors.length) {
      colorPickerRef.current.addColor(colors[1]);
    } else if (colorPickerRef.current.colors.length > colors.length) {
      colorPickerRef.current.removeColor(1);
    }
  }, [colors]);

  return <div id="colorPicker" className="colorPicker"></div>;
};

export default ColorPicker;

ColorPicker.propTypes = {
  startingColors: PropTypes.arrayOf(PropTypes.object),
  colors: PropTypes.arrayOf(PropTypes.object),
  onColorChange: PropTypes.func.isRequired,
  onColorRemove: PropTypes.func.isRequired,
  colorPickerContainerRef: PropTypes.object.isRequired,
};
