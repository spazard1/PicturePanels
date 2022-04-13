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

  "lightSpeedInRight",
  "lightSpeedInLeft",

  "rotateIn",
  "rotateInDownLeft",
  "rotateInDownRight",
  "rotateInUpLeft",
  "rotateInUpRight",

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
  "backOutUp",

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

  "rotateOut",
  "rotateOutDownLeft",
  "rotateOutDownRight",
  "rotateOutUpLeft",
  "rotateOutUpRight",

  "hinge",

  "rollOut",

  "zoomOut",

  "zoomOutDown",
  "zoomOutLeft",
  "zoomOutRight",
  "zoomOutUp",

  "slideOutDown",
  "slideOutLeft",
  "slideOutRight",
  "slideOutUp",
];

export const GetEntranceClass = () => {
  return "animate__" + entranceAnimations[Math.floor(Math.random() * entranceAnimations.length)];
};

export const GetExitClass = () => {
  return "animate__" + exitAnimations[Math.floor(Math.random() * exitAnimations.length)];
};

export const GetAnimationClass = () => {
  return "animate__animated";
};
