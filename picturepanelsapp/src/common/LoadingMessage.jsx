import React, { useState } from "react";

const LoadingMessage = () => {
  const delay = 250; // 200ms
  const [showLoadingIndicator, setLoadingIndicatorVisibility] = useState(false);
  setTimeout(() => {
    setLoadingIndicatorVisibility(true);
  }, delay);

  if (showLoadingIndicator) {
    return <div className="loadingMessageContainer">Loading Picture Panels...</div>;
  }

  return null;
};

export default LoadingMessage;
