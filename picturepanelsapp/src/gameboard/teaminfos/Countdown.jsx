import React, { useEffect, useRef } from "react";
import useTimeRemaining from "../../common/useTimeRemaining";
import PropTypes from "prop-types";
import "./Countdown.css";

const Countdown = ({ isPaused, turnTime, turnTimeRemaining }) => {
  const canvasRef = useRef();
  const timeRemaining = useTimeRemaining(isPaused, turnTime, turnTimeRemaining, 30);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    var ctx = canvas.getContext("2d");

    var scale = 0.35;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (canvas.currentCountdown <= 0) {
      return;
    }

    var circleSize = canvas.height * scale;
    var circlePosition = canvas.height * 0.5;
    var strokeWidth = canvas.height * scale * 0.5;

    const canvasSize = Math.floor(canvas.clientHeight);
    const circleRotatePosition = Math.floor(canvasSize / 2) * window.devicePixelRatio;

    ctx.save();
    ctx.translate(circleRotatePosition, circleRotatePosition); // First translate the context to the center you wish to rotate around.
    ctx.rotate(1.5 * Math.PI); // Then do the actual rotation.
    ctx.translate(-circleRotatePosition, -circleRotatePosition); // Then translate the context back.

    ctx.beginPath();

    ctx.arc(circlePosition, circlePosition, circleSize, 0, timeRemaining.percentageRemaining * 2 * Math.PI);
    ctx.strokeStyle = "white";
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(circleRotatePosition, circleRotatePosition); // First translate the context to the center you wish to rotate around.
    ctx.rotate(0); // Then do the actual rotation.
    ctx.translate(-circleRotatePosition, -circleRotatePosition); // Then translate the context back.

    ctx.font = Math.floor(circleSize * 0.95) + "px system-ui";
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFFFFF";
    const secondsRemaining = Math.ceil(timeRemaining.millisecondsRemaining / 1000);
    if (secondsRemaining <= 60 && secondsRemaining > 0) {
      ctx.fillText(secondsRemaining, circlePosition, circlePosition + circlePosition * 0.2);
    }
    ctx.restore();
  }, [timeRemaining]);

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    canvas.style = "";
    const ctx = canvas.getContext("2d");
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const canvasSize = Math.floor(canvas.clientHeight);
    canvas.style.height = canvasSize + "px";
    canvas.style.width = canvasSize + "px";
    canvas.height = canvasSize * window.devicePixelRatio;
    canvas.width = canvasSize * window.devicePixelRatio;
  };

  useEffect(() => {
    setupCanvas();
  }, []);

  return (
    <div className="countdown">
      <canvas ref={canvasRef} className="countdownCanvas" height="123" width="123" style={{ height: 82, width: 82 }}></canvas>
    </div>
  );
};

Countdown.propTypes = {
  isPaused: PropTypes.bool.isRequired,
  turnTime: PropTypes.number,
  turnTimeRemaining: PropTypes.number,
};

export default React.memo(Countdown);
