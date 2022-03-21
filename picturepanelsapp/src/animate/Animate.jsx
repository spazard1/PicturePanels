const entranceAnimations = [
  "backInDown",
  "backInLeft",
  "backInRight",
  "backInUp",
  "bounceInDown",
  "bounceInLeft",
  "bounceInRight",
  "bounceInUp",
  "fadeInDown",
  "fadeInLeft",
  "fadeInRight",
  "fadeInUp",
  "fadeInTopLeft",
  "fadeInTopRight",
  "fadeInBottomLeft",
  "fadeInBottomRight",
  "flipInX",
  "flipInY",
  "jackInTheBox",
  "rollIn",
  "zoomIn",
  "zoomInDown",
  "zoomInLeft",
  "zoomInRight",
  "zoomInUp",
  "slideInDown",
  "slideInLeft",
  "slideInRight",
  "slideInUp",
];
const exitAnimations = [
  "backOutDown",
  "backOutLeft",
  "backOutRight",
  "bounceOutDown",
  "bounceOutLeft",
  "bounceOutRight",
  "bounceOutUp",
  "fadeOutDown",
  "fadeOutLeft",
  "fadeOutRight",
  "fadeOutUp",
  "fadeOutTopLeft",
  "fadeOutTopRight",
  "fadeOutBottomLeft",
  "fadeOutBottomRight",
  "flipOutX",
  "flipOutY",
  "lightSpeedOutRight",
  "lightSpeedOutLeft",
  "hinge",
  "rollOut",
  "zoomOut",
  "zoomOutDown",
  "zoomOutLeft",
  "zoomOutRight",
  "zoomOutUp",
];

export const GetEntranceClass = () => {
  return (
    "animate__" +
    entranceAnimations[Math.floor(Math.random() * entranceAnimations.length)]
  );
};

export const GetExitClass = () => {
  return (
    "animate__" +
    exitAnimations[Math.floor(Math.random() * exitAnimations.length)]
  );
};

export const GetAnimationClass = () => {
  return "animate__animated";
};
