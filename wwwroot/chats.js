const typingIndicatorTime = 6000;
const imageRegex = /(http([^\s]*))/gi;

async function getChats(teamNumber) {
    if (!teamNumber) {
        teamNumber = localStorage.getItem("teamNumber");
    }
    return await fetch("api/chats/" + teamNumber)
        .then(response => response.json())
        .then(responseJson => {
            return responseJson;
        });
}

async function drawChats(chatsElementId, teamNumber) {
    var chatsElement = document.getElementById(chatsElementId);

    while (chatsElement.firstChild) {
        chatsElement.removeChild(chatsElement.firstChild);
    }
    setupChatTypingIndicator(chatsElementId);

    var chats = await getChats(teamNumber);

    chats.forEach(chat => {
        drawChat(chatsElementId, chat.message, chat.player, true);
    });
}

var lastTypingTime;
function setupChats(chatsElementId, teamNumber) {
    if (!teamNumber) {
        teamNumber = parseInt(localStorage.getItem("teamNumber"));
    }

    var chatsElement = document.getElementById(chatsElementId);
    chatsElement.classList.add("smoothScroll");
    chatsElement.onclick = function (event) {
        document.getElementById(chatsElementId + "_inputText").blur();
    };

    document.getElementById(chatsElementId + "_send").onclick = function (event) {
        sendChat(chatsElementId, teamNumber);
    };

    var chatInputText = document.getElementById(chatsElementId + "_inputText");
    chatInputText.onkeyup = (event) => {
        if (event.which === 13) {
            sendChat(chatsElementId, teamNumber);
            return;
        }

        if (lastTypingTime && new Date() - lastTypingTime < typingIndicatorTime - 1000) {
            return;
        }
        lastTypingTime = new Date();

        connection.invoke("Typing", {
            PlayerId: localStorage.getItem("playerId"),
            Name: localStorage.getItem("playerName"),
            TeamNumber: teamNumber
        });
    }

    setupInputDefaultText(chatsElementId + "_inputText", "send a team message...")

    setupChatTypingIndicator(chatsElementId);
}

function setupChatTypingIndicator(chatsElementId) {
    if (document.getElementById(chatsElementId + "_typingIndicator")) {
        return;
    }

    var chatElement = document.createElement("div");
    chatElement.id = chatsElementId + "_typingIndicator";
    chatElement.classList.add("chat");
    chatElement.classList.add("othersChat");
    chatElement.classList.add("hidden");

    var playerNames = document.createElement("span");
    playerNames.id = chatsElementId + "_typingIndicatorPlayers";
    chatElement.appendChild(playerNames);

    var colon = document.createElement("span");
    colon.appendChild(document.createTextNode(": "));
    chatElement.appendChild(colon);

    for (var i = 1; i <= 3; i++) {
        var ellipsis = document.createElement("span");
        ellipsis.classList.add("ellipsis");
        ellipsis.classList.add("ellipsis" + i);
        ellipsis.appendChild(document.createTextNode("."));
        chatElement.appendChild(ellipsis);
    }

    var chatsElement = document.getElementById(chatsElementId);
    chatsElement.prepend(chatElement);
}

function drawChat(chatsElementId, message, player, skipScroll) {
    var chatsElement = document.getElementById(chatsElementId);

    message = message.replaceAll(imageRegex, "<img class=\"chatImage\" src=\"$1\"/>");

    var chatElement = document.createElement("div");
    chatElement.classList.add("chat");

    if (!player) {
        chatElement.classList.add("othersChat");

        var chatMessage = document.createElement("span");
        chatMessage.innerHTML = "(unknown player): " + message;
        chatElement.appendChild(chatMessage);

    } else if (player.playerId === localStorage.getItem("playerId")) {
        stoppedTyping(chatsElementId, player);

        chatElement.classList.add("selfChat");

        var chatMessage = document.createElement("span");
        chatMessage.innerHTML = message;
        chatElement.appendChild(chatMessage);
    } else {
        stoppedTyping(chatsElementId, player);

        chatElement.classList.add("othersChat");

        var playerName = document.createElement("span");
        if (player.isAdmin) {
            playerName.classList.add("adminPlayerName")
        }
        playerName.style = "color: " + player.color + ";";
        playerName.appendChild(document.createTextNode(player.name));
        chatElement.appendChild(playerName);

        var chatMessage = document.createElement("span");
        chatMessage.innerHTML = ": " + message;
        chatElement.appendChild(chatMessage);
    }

    var typingIndicator = document.getElementById(chatsElementId + "_typingIndicator");
    if (typingIndicator.nextElementSibling) {
        chatsElement.insertBefore(chatElement, typingIndicator.nextElementSibling);
    } else {
        chatsElement.appendChild(chatElement);
    }

    if (chatsElement.childElementCount > 1000) {
        chatsElement.lastChild.remove();
    }

    if (!skipScroll) {
        if (player.playerId === localStorage.getItem("playerId")) {
            scrollChats(chatsElementId, true);
        } else {
            scrollChats(chatsElementId);
        }
    }
}

function drawSystemChat(chatsElementId, chatMessage, player) {
    var chatElement = document.createElement("div");
    chatElement.classList.add("chat");
    chatElement.classList.add("systemChat");

    if (player) {
        var playerName = document.createElement("span");
        if (player.isAdmin) {
            playerName.classList.add("adminPlayerName")
        }
        playerName.style = "color: " + player.color + ";";
        playerName.appendChild(document.createTextNode(player.name + " "));
        chatElement.appendChild(playerName);
    }

    var chatMessageElement = document.createElement("span");
    chatMessageElement.appendChild(document.createTextNode(chatMessage));
    chatElement.appendChild(chatMessageElement);

    var chatsElement = document.getElementById(chatsElementId);
    var typingIndicator = document.getElementById(chatsElementId + "_typingIndicator");
    if (typingIndicator.nextElementSibling) {
        chatsElement.insertBefore(chatElement, typingIndicator.nextElementSibling);
    } else {
        chatsElement.appendChild(chatElement);
    }

    if (chatsElement.childElementCount > 1000) {
        chatsElement.lastChild.remove();
    }

    scrollChats(chatsElementId);
}

function scrollChats(chatsElementId, force) {
    var chatsElement = document.getElementById(chatsElementId);

    if (force || chatsElement.scrollTop > -150) {
        chatsElement.scrollTop = chatsElement.scrollHeight;
    }
}

var playersTyping = {};
function handleTyping(chatsElementId, player) {
    if (player.playerId === localStorage.getItem("playerId")) {
        return;
    }

    if (!playersTyping[chatsElementId]) {
        playersTyping[chatsElementId] = {};
    }

    playersTyping[chatsElementId][player.playerId] = player;
    playersTyping[chatsElementId][player.playerId].typingTime = new Date();

    drawTypingIndicators(chatsElementId);

    scrollChats(chatsElementId);
}

function stoppedTyping(chatsElementId, player) {
    if (!playersTyping[chatsElementId]) {
        return;
    }
    delete playersTyping[chatsElementId][player.playerId];

    drawTypingIndicators(chatsElementId);
}

var typingIndicatorsTimeouts = {};
function drawTypingIndicators(chatsElementId) {
    clearInterval(typingIndicatorsTimeouts[chatsElementId]);

    var typingIndicator = document.getElementById(chatsElementId + "_typingIndicator");
    var typingIndicatorPlayers = document.getElementById(chatsElementId + "_typingIndicatorPlayers");
    typingIndicatorPlayers.innerHTML = "";

    var maxPlayersToDisplay = 3;
    var remainingPlayersToDisplay = maxPlayersToDisplay;
    for (var playerTypingId in playersTyping[chatsElementId]) {
        var playerTyping = playersTyping[chatsElementId][playerTypingId];

        if (new Date() - playerTyping.typingTime > typingIndicatorTime) {
            delete playersTyping[chatsElementId][playerTypingId];
            continue;
        }
        if (remainingPlayersToDisplay < maxPlayersToDisplay) {
            var comma = document.createElement("span");
            comma.appendChild(document.createTextNode(", "));
            typingIndicatorPlayers.appendChild(comma);
        }

        var playerName = document.createElement("span");
        if (playerTyping.isAdmin) {
            playerName.classList.add("adminPlayerName")
        }
        playerName.style = "color: " + playerTyping.color + ";";
        playerName.appendChild(document.createTextNode(playerTyping.name));
        typingIndicatorPlayers.appendChild(playerName);

        remainingPlayersToDisplay--;
        if (remainingPlayersToDisplay <= 0) {
            break;
        }
    }

    if (Object.keys(playersTyping[chatsElementId]).length > maxPlayersToDisplay) {
        var comma = document.createElement("span");
        comma.appendChild(document.createTextNode(", +" + (Object.keys(playersTyping[chatsElementId]).length - maxPlayersToDisplay)));
        typingIndicatorPlayers.appendChild(comma);
    }

    if (Object.keys(playersTyping[chatsElementId]).length > 0) {
        typingIndicator.classList.remove("hidden");
        typingIndicatorsTimeouts[chatsElementId] = setTimeout(function () {
            drawTypingIndicators(chatsElementId);
        }, 1000);

    } else {
        typingIndicator.classList.add("hidden");
    }
}

async function sendChat(chatsElementId, teamNumber) {
    var chatInputText = document.getElementById(chatsElementId + "_inputText");

    if (!chatInputText.value || chatInputText.value === chatInputText.defaultValue) {
        return;
    }

    if (mobileCheck()) {
        chatInputText.focus();
    }

    if (chatInputText.value.toLowerCase() === "/captain") {
        putImTheCaptainNow();
        chatInputText.value = "";
        return;
    }

    lastTypingTime = null;

    var player = {
        playerId: localStorage.getItem("playerId"),
        name: localStorage.getItem("playerName"),
        teamNumber: teamNumber
    };

    connection.invoke("Chat", player, chatInputText.value);
    drawChat(chatsElementId, chatInputText.value, player);

    if (document.activeElement === chatInputText) {
        chatInputText.value = "";
    } else {
        chatInputText.value = chatInputText.defaultValue;
        chatInputText.classList.add("inputDefaultText");
    }
}
