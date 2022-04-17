import React from "react";
//import PropTypes from "prop-types";

import "./Chat.css";

const Chat = () => {
  return (
    <>
      <div id="chats" className="chats hidden"></div>
      <div id="chats_input" className="chatInputContainer hidden">
        <div className="chatInputText grow-wrap">
          <textarea id="chats_inputText" name="text" rows="1" maxLength="150" placeholder="chat with your team..."></textarea>
        </div>
        <div id="chats_send" className="defaultButton chatSendButton">
          Chat
        </div>
      </div>
    </>
  );
};

export default Chat;

Chat.propTypes = {};
