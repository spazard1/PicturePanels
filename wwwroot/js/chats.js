const typingIndicatorTime = 6000;
const imageRegex = /(http([^\s]*))/gi;

async function getChats(teamNumber) {
    if (!teamNumber) {
        teamNumber = localStorage.getItem("teamNumber");
    }
    return await fetch("api/chats/" + localStorage.getItem("gameStateId") + "/" + teamNumber)
        .then(response => response.json())
        .then(responseJson => {
            return responseJson;
        });
}

async function drawChatsAsync(chatsElementId, teamNumber) {
    var chatsElement = document.getElementById(chatsElementId);

    while (chatsElement.firstChild) {
        chatsElement.removeChild(chatsElement.firstChild);
    }
    setupChatTypingIndicator(chatsElementId);

    var chats = await getChats(teamNumber);

    chats.forEach(chat => {
        drawChat(chatsElementId, chat, true);
    });
}

function sortChats(chatsElementId) {
    var chatsElement = document.getElementById(chatsElementId);

    var children = Array.from(chatsElement.childNodes);

    children.sort((a, b) => {
        return a.ticks - b.ticks;
    });

    children.reverse();

    children.forEach((child) => chatsElement.append(child));

    setupChatTypingIndicator(chatsElementId);
}

var lastTypingTime;
function setupChats(chatsElementId, teamNumber) {
    if (!teamNumber) {
        teamNumber = parseInt(localStorage.getItem("teamNumber"));
    }

    if (!teamNumber) {
        throw new Error("No team number set in setupChats");
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

    setupInputDefaultText(chatsElementId + "_inputText", "chat with your team...")

    setupChatTypingIndicator(chatsElementId);

    setupGrowers();
}

function setupChatTypingIndicator(chatsElementId) {
    var chatTypingIndicatorElement = document.getElementById(chatsElementId + "_typingIndicator");
    var chatsElement = document.getElementById(chatsElementId);

    if (chatTypingIndicatorElement) {
        chatsElement.prepend(chatTypingIndicatorElement);
        return;
    }

    chatTypingIndicatorElement = document.createElement("div");
    chatTypingIndicatorElement.id = chatsElementId + "_typingIndicator";
    chatTypingIndicatorElement.classList.add("chat");
    chatTypingIndicatorElement.classList.add("othersChat");
    chatTypingIndicatorElement.classList.add("hidden");

    var playerNames = document.createElement("span");
    playerNames.id = chatsElementId + "_typingIndicatorPlayers";
    chatTypingIndicatorElement.appendChild(playerNames);

    var colon = document.createElement("span");
    colon.appendChild(document.createTextNode(": "));
    chatTypingIndicatorElement.appendChild(colon);

    for (var i = 1; i <= 3; i++) {
        var ellipsis = document.createElement("span");
        ellipsis.classList.add("ellipsis");
        ellipsis.classList.add("ellipsis" + i);
        ellipsis.appendChild(document.createTextNode("."));
        chatTypingIndicatorElement.appendChild(ellipsis);
    }

    chatsElement.prepend(chatTypingIndicatorElement);
}

function setupGrowers() {
    const growers = document.querySelectorAll(".grow-wrap");

    growers.forEach((grower) => {
        const textarea = grower.querySelector("textarea");
        textarea.addEventListener("input", (event) => {
            grower.dataset.replicatedValue = textarea.value;
        });
    });
}

const multipleNewLines = /[\n\r]+/g;

function drawChat(chatsElementId, chat, skipScroll) {
    var chatsElement = document.getElementById(chatsElementId);

    chat.message = chat.message.trim();
    chat.message = chat.message.replaceAll(multipleNewLines, "\n");
    chat.message = chat.message.replaceAll(imageRegex, "<img class=\"chatImage\" src=\"$1\"/>");
    chat.message = chat.message.replaceAll("\n", "<br/>");

    var chatElement = document.createElement("div");
    if (chat.ticks) {
        chatElement.id = "chat_" + chat.ticks;
        chatElement.ticks = chat.ticks;
    } else {
        chatElement.ticks = 0;
    }

    chatElement.classList.add("chat");
    var chatMessage;

    if (chat.player) {
        stoppedTyping(chatsElementId, chat.player);
    }

    if (chat.isSystem) {
        chatElement.classList.add("systemChat");
    }

    if (!chat.isSystem && chat.player.playerId === localStorage.getItem("playerId")) {
        chatElement.classList.add("selfChat");

        chatMessage = document.createElement("span");
        chatMessage.innerHTML = chat.message;
        chatElement.appendChild(chatMessage);
    } else {
        chatElement.classList.add("othersChat");

        if (chat.player) {
            var playerName = document.createElement("span");
            if (chat.player.isAdmin) {
                playerName.classList.add("adminPlayerName")
            }
            playerName.style = "color: " + chat.player.color + ";";
            playerName.appendChild(document.createTextNode(chat.player.name));
            chatElement.appendChild(playerName);
        }

        chatMessage = document.createElement("span");
        if (chat.isSystem) {
            chatMessage.innerHTML = " " + chat.message;
        } else {
            chatMessage.innerHTML = ": " + chat.message;
        }
        chatElement.appendChild(chatMessage);
    }

    var typingIndicator = document.getElementById(chatsElementId + "_typingIndicator");
    if (typingIndicator && typingIndicator.nextElementSibling) {
        chatsElement.insertBefore(chatElement, typingIndicator.nextElementSibling);
    } else {
        chatsElement.appendChild(chatElement);
    }

    if (chatsElement.childElementCount > 1000) {
        chatsElement.lastChild.remove();
    }

    if (!skipScroll) {
        if (chat.player && chat.player.playerId === localStorage.getItem("playerId")) {
            scrollChats(chatsElementId, true);
        } else {
            scrollChats(chatsElementId);
        }
    }
}

function drawSystemChat(chatsElementId, chat) {
    chat.isSystem = true;
    drawChat(chatsElementId, chat);
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

    lastTypingTime = null;

    var player = {
        playerId: localStorage.getItem("playerId"),
        name: localStorage.getItem("playerName"),
        teamNumber: teamNumber
    };

    connection.invoke("Chat", player, chatInputText.value);
    drawChat(chatsElementId, { message: chatInputText.value, player: player });

    if (document.activeElement === chatInputText) {
        chatInputText.value = "";
    } else {
        chatInputText.value = chatInputText.defaultValue;
        chatInputText.classList.add("inputDefaultText");
    }

    chatInputText.parentElement.dataset.replicatedValue = chatInputText.value;
}
