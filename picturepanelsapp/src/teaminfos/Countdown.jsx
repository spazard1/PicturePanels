import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import "./Countdown.css";

const Countdown = ({ isPaused, turnTime, turnTimeTotal, turnTimeRemaining, pauseTurnRemainingTime }) => {
  const canvasRef = useRef();
  const intervalRef = useRef();
  const endTimeRef = useRef();
  const frameRate = 30;

  console.log("Countdown pauseTurnRemainingTime", pauseTurnRemainingTime);

  function drawCountdown() {
    const canvas = canvasRef.current;
    var ctx = canvas.getContext("2d");

    var scale = 0.55;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (canvas.currentCountdown <= 0) {
      return;
    }

    var circleSize = (canvas.height / 2) * scale;
    var circlePosition = canvas.height / 2;
    var strokeWidth = (canvas.height / 2) * scale;

    ctx.beginPath();

    console.log(pauseTurnRemainingTime, canvas.currentCountdown, canvas.countdownMax);
    ctx.arc(
      circlePosition,
      circlePosition,
      circleSize,
      0,
      (Math.min(canvas.currentCountdown, canvas.countdownMax) / canvas.countdownMax) * 2 * Math.PI
    );
    ctx.strokeStyle = "white";
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  }

  function setupCanvas() {
    const canvas = canvasRef.current;
    canvas.style = "";
    const ctx = canvas.getContext("2d");
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const canvasSize = Math.floor(canvas.clientHeight);
    canvas.style.height = canvasSize + "px";
    canvas.style.width = canvasSize + "px";
    canvas.height = canvasSize * window.devicePixelRatio;
    canvas.width = canvasSize * window.devicePixelRatio;

    const circlePosition = Math.floor(canvasSize / 2) * window.devicePixelRatio;

    ctx.translate(circlePosition, circlePosition); // First translate the context to the center you wish to rotate around.
    ctx.rotate(1.5 * Math.PI); // Then do the actual rotation.
    ctx.translate(-circlePosition, -circlePosition); // Then translate the context back.
  }

  useEffect(() => {
    setupCanvas();

    const canvas = canvasRef.current;
    canvas.countdownMax = turnTime * 1000;
    canvas.currentCountdown = turnTimeRemaining;
    endTimeRef.current = new Date();
    endTimeRef.current.setMilliseconds(endTimeRef.current.getMilliseconds() + turnTimeRemaining * 1000);
    console.log("countdown: ", endTimeRef.current);

    if (canvas.countdownMax <= 0) {
      return;
    }

    clearInterval(intervalRef.current);

    if (isPaused) {
      canvas.currentCountdown = pauseTurnRemainingTime * 1000;
      drawCountdown(canvas);
      return;
    }

    intervalRef.current = setInterval(function () {
      if (canvas.currentCountdown <= 0) {
        clearInterval(intervalRef.current);
      } else {
        canvas.currentCountdown = endTimeRef.current - new Date();
      }

      drawCountdown(canvas);
    }, 1000 / frameRate);
  }, [isPaused, turnTime, turnTimeTotal, turnTimeRemaining, pauseTurnRemainingTime]);

  return (
    <div className="countdown">
      <canvas ref={canvasRef} className="countdownCanvas" height="123" width="123" style={{ height: 82, width: 82 }}></canvas>
    </div>
  );
};

Countdown.propTypes = {
  isPaused: PropTypes.bool.isRequired,
  turnTime: PropTypes.number.isRequired,
  turnTimeTotal: PropTypes.number.isRequired,
  turnTimeRemaining: PropTypes.number.isRequired,
  pauseTurnRemainingTime: PropTypes.number.isRequired,
};

export default React.memo(Countdown);
