async function panelButtonOnClick(event) {
    if (event.currentTarget.classList.contains("panelButtonDisabled")) {
        event.currentTarget.classList.remove("panelButtonSelected");
        return;
    }

    event.currentTarget.classList.toggle("panelButtonSelected");
    event.currentTarget.blur();

    await sendSelectedPanels();
}

function setupPlayerMenu() {
    var initialColor = "hsl(" + Math.ceil(Math.random() * 360) + ", 100%, 50%)";

    if (localStorage.getItem("playerColor")) {
        initialColor = localStorage.getItem("playerColor");
    }

    window.colorPicker = new iro.ColorPicker("#colorPicker", {
        layout: [
            {
                component: iro.ui.Wheel,
                options: {}
            },
        ],
        color: initialColor
    });

    if (localStorage.getItem("playerName")) {
        document.getElementById("playerNameInput").style.color = initialColor;
    }

    document.getElementById("playerNameInput").oninput = function (event) {
        event.target.style.color = window.colorPicker.color.hslString;
    }

    window.colorPicker.on('color:change', function (color) {
        color.value = 100;
        document.getElementById("playerNameInput").style.color = color.hslString;
    });

    setupInputDefaultText("playerNameInput", "your name", localStorage.getItem("playerName"));
}

var playerLoaded = false;

function drawPlayer(player) {
    if (player.selectedPanels) {
        var panelButtons = document.getElementsByClassName("panelButton");
        for (let panelButton of panelButtons) {
            if (player.selectedPanels.includes(panelButton.value)) {
                panelButton.classList.add("panelButtonSelected");
            }
        }
    }

    if (player.isAdmin) {
        document.getElementById("playerName").classList.add("adminPlayerName");
    }
}

async function putPlayerAsync() {
    return await fetch("api/players/" + localStorage.getItem("playerId"),
    {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            PlayerId: localStorage.getItem("playerId"),
            Name: localStorage.getItem("playerName"),
            TeamNumber: parseInt(localStorage.getItem("teamNumber")),
            Color: localStorage.getItem("playerColor")
        })
    })
    .then(response => response.json())
    .then(responseJson => {
        return responseJson;
    });
}

async function putPlayerPingAsync() {
    if (!playerIsReadyToPlay) {
        return;
    }
    
    await fetch("api/players/" + localStorage.getItem("playerId") + "/ping",
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            }
        });
}

async function putCaptainPass() {
    if (!playerIsReadyToPlay) {
        return;
    }

    document.getElementById("captainGuessButton").classList.add("captainButtonDisabled");
    document.getElementById("captainGuessButton").classList.remove("captainButtonSelected");

    document.getElementById("captainPassButton").classList.remove("captainButtonDisabled");
    document.getElementById("captainPassButton").classList.add("captainButtonSelected");

    await fetch("api/gameState/captainPass/" + localStorage.getItem("playerId"),
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            }
        });
}

async function putCaptainGuess() {
    if (!playerIsReadyToPlay) {
        return;
    }

    document.getElementById("captainGuessButton").classList.remove("captainButtonDisabled");
    document.getElementById("captainGuessButton").classList.add("captainButtonSelected");

    document.getElementById("captainPassButton").classList.add("captainButtonDisabled");
    document.getElementById("captainPassButton").classList.remove("captainButtonSelected");

    await fetch("api/gameState/captainGuess/" + localStorage.getItem("playerId"),
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            }
        });
}

async function putImTheCaptainNow() {
    if (!playerIsReadyToPlay) {
        return;
    }

    await fetch("api/gameState/captain/" + localStorage.getItem("playerId"),
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            }
        });
}

function setupChoosePlayerName() {
    playerIsReadyToPlay = false;
    document.getElementById("chooseSmallestTeam").innerHTML = "Choose for me";

    document.getElementById("turnStatusContainer").classList.add("hidden");

    document.getElementById("choosePlayerNameLabel").classList.remove("hidden");
    document.getElementById("playerNameInputDiv").classList.remove("hidden");

    document.getElementById("colorPicker").classList.remove("hidden");
    document.getElementById("choosePlayerName").classList.remove("hidden");

    document.getElementById("playerBanner").classList.add("hidden");
    document.getElementById("chooseTeam").classList.add("hidden");
    document.getElementById("teamOneName").classList.add("hidden");
    document.getElementById("teamTwoName").classList.add("hidden");

    document.getElementById("playerName").classList.add("hidden");
    document.getElementById("teamOneName").classList.add("chooseTeamName");
    document.getElementById("teamTwoName").classList.add("chooseTeamName");
    document.getElementById("chooseSmallestTeam").classList.remove("hidden");

    document.getElementById("panelButtons").classList.add("hidden");

    document.getElementById("chats").classList.add("hidden");
    document.getElementById("chats_input").classList.add("hidden");

    document.getElementById("playerName").style.color = localStorage.getItem("playerColor");
    document.getElementById("playerBanner").classList.add("playerBannerChooseTeam");
    document.getElementById("playerBanner").classList.remove("playerBannerPlaying");
    document.getElementById("playerBanner").onclick = null;
    document.getElementById("turnStatusContainer").onclick = null;

    document.getElementById("teamOneName").classList.remove("teamOneColor");
    document.getElementById("teamOneName").classList.add("teamOneBox");

    document.getElementById("teamTwoName").classList.remove("teamTwoColor");
    document.getElementById("teamTwoName").classList.add("teamTwoBox");
}

function choosePlayerNameButtonOnClick() {
    var playerNameInput = document.getElementById("playerNameInput");
    if (playerNameInput.value.length <= 1 || playerNameInput.value === playerNameInput.defaultValue) {
        document.getElementById("playerNameInput").classList.add("playerNameInputDivInvalid");
        return;
    }

    playerNameChosen({
        name: document.getElementById("playerNameInput").value,
        color: window.colorPicker.color.hslString
    });
}

function playerNameChosen(player) {
    localStorage.setItem("playerName", player.name);
    localStorage.setItem("playerColor", player.color);
    document.getElementById("playerName").innerHTML = player.name;

    document.getElementById("choosePlayerNameLabel").classList.add("hidden");
    document.getElementById("playerNameInputDiv").classList.add("hidden");
    document.getElementById("colorPicker").classList.add("hidden");
    document.getElementById("choosePlayerName").classList.add("hidden");

    document.getElementById("playerBanner").classList.remove("hidden");
    document.getElementById("chooseTeam").classList.remove("hidden");
    document.getElementById("teamOneName").classList.remove("hidden");
    document.getElementById("teamTwoName").classList.remove("hidden");

    setupTeamSelectionButtons();
}

var playerIsReadyToPlay = false;

function teamChosen(teamNumber) {
    localStorage.setItem("teamNumber", teamNumber);

    drawTeam(teamNumber);
    setupChats("chats");
}

function shouldPlayerLoadFromCache() {
    if (localStorage.getItem("createdTime")) {
        var createdTime = new Date(localStorage.getItem("createdTime"));
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (createdTime > yesterday) {
            return true;
        }
    }

    return false;
}

async function setupPlayerAsync() {
    if (shouldPlayerLoadFromCache() && localStorage.getItem("playerName") && localStorage.getItem("playerColor") && localStorage.getItem("teamNumber")) {
        playerNameChosen({
            name: localStorage.getItem("playerName"),
            color: localStorage.getItem("playerColor")
        });
        teamChosen(parseInt(localStorage.getItem("teamNumber")));
        return finalizePlayerAsync();
    } else {
        localStorage.setItem("createdTime", new Date());
        setupChoosePlayerName();
    }
}

async function finalizePlayerAsync() {
    var promises = [];
    promises.push(putPlayerAsync());
    promises.push(startSignalRAsync("player"));
    promises.push(drawChatsAsync("chats"));

    var results = await Promise.all(promises);

    drawPlayer(results[0]); // first promise is the putPlayer

    document.getElementById("playerBanner").onclick = (event) => {
        var result = confirm("Do you want to change your player name, color, or team?");
        if (!result) {
            return;
        }
        setupChoosePlayerName();
    };

    document.getElementById("turnStatusContainer").onclick = (event) => {
        var result = confirm("Do you want to change your player name, color, or team?");
        if (!result) {
            return;
        }
        setupChoosePlayerName();
    };

    scrollChats("chats", true);
    playerIsReadyToPlay = true;
}

function setupTeamSelectionButtons() {
    document.getElementById("teamOneName").onclick = async function () {
        teamChosen(1);
        await finalizePlayerAsync();
        notifyTurn(currentGameState);
    };
    document.getElementById("teamTwoName").onclick = async function () {
        teamChosen(2);
        await finalizePlayerAsync();
        notifyTurn(currentGameState);
    };
    document.getElementById("chooseSmallestTeam").onclick = async function () {
        await chooseSmallestTeam();
        await finalizePlayerAsync();
        notifyTurn(currentGameState);
    };
}

async function chooseSmallestTeam() {
    document.getElementById("chooseSmallestTeam").innerHTML = "Loading...";

    await fetch("api/players")
        .then(response => response.json())
        .then(responseJson => {
            var teamOneCount = 0;
            var teamTwoCount = 0;
            for (var i = 0; i < responseJson.length; i++) {
                if (responseJson[i].playerId === localStorage.getItem("playerId")) {
                    continue;
                }
                if (responseJson[i].teamNumber === 1) {
                    teamOneCount++;
                } else {
                    teamTwoCount++;
                }
            }

            if (teamOneCount < teamTwoCount) {
                teamChosen(1);
            } else if (teamOneCount > teamTwoCount) {
                teamChosen(2);
            } else {
                if (Math.random() < .5) {
                    teamChosen(1);
                } else {
                    teamChosen(2);
                }
            }
        });
}

function drawTeam(teamNumber) {
    updatePlayerPanelButtons(currentGameState);

    document.getElementById("turnStatusContainer").classList.remove("hidden");

    if (teamNumber === 1) {
        document.getElementById("teamOneName").classList.remove("hidden");
        document.getElementById("teamTwoName").classList.add("hidden");
    } else {
        document.getElementById("teamOneName").classList.add("hidden");
        document.getElementById("teamTwoName").classList.remove("hidden");
    }

    document.getElementById("playerName").classList.remove("hidden");
    document.getElementById("teamOneName").classList.remove("chooseTeamName");
    document.getElementById("teamOneName").onclick = null;
    document.getElementById("teamTwoName").classList.remove("chooseTeamName");
    document.getElementById("teamTwoName").onclick = null;
    document.getElementById("chooseSmallestTeam").onclick = null;
    document.getElementById("chooseSmallestTeam").classList.add("hidden");

    document.getElementById("chooseTeam").classList.add("hidden");

    document.getElementById("chats").classList.remove("hidden");
    document.getElementById("chats_input").classList.remove("hidden");

    document.getElementById("playerName").style.color = localStorage.getItem("playerColor");
    document.getElementById("playerBanner").classList.remove("playerBannerChooseTeam");
    document.getElementById("playerBanner").classList.add("playerBannerPlaying");

    document.getElementById("teamOneName").classList.add("teamOneColor");
    document.getElementById("teamOneName").classList.remove("teamOneBox");

    document.getElementById("teamTwoName").classList.add("teamTwoColor");
    document.getElementById("teamTwoName").classList.remove("teamTwoBox");
}

function isCaptain(gameState) {
    if (!gameState) {
        return false;
    }
    return (gameState.teamOneCaptain === localStorage.getItem("playerId") && localStorage.getItem("teamNumber") === "1") ||
        (gameState.teamTwoCaptain === localStorage.getItem("playerId") && localStorage.getItem("teamNumber") === "2");
}

function handleCaptainButtons(gameState) {
    if (gameState.turnType === "MakeGuess" && isCaptain(gameState) && gameState.teamTurn === parseInt(localStorage.getItem("teamNumber"))) {
        if (gameState.captainStatus === "Guess") {
            document.getElementById("captainGuessButton").classList.remove("captainButtonDisabled");
            document.getElementById("captainGuessButton").classList.add("captainButtonSelected");

            document.getElementById("captainPassButton").classList.add("captainButtonDisabled");
            document.getElementById("captainPassButton").classList.remove("captainButtonSelected");
        } else if (gameState.captainStatus === "Pass") {
            document.getElementById("captainGuessButton").classList.add("captainButtonDisabled");
            document.getElementById("captainGuessButton").classList.remove("captainButtonSelected");

            document.getElementById("captainPassButton").classList.remove("captainButtonDisabled");
            document.getElementById("captainPassButton").classList.add("captainButtonSelected");
        } else {
            document.getElementById("captainGuessButton").classList.remove("captainButtonDisabled");
            document.getElementById("captainGuessButton").classList.remove("captainButtonSelected");

            document.getElementById("captainPassButton").classList.remove("captainButtonDisabled");
            document.getElementById("captainPassButton").classList.remove("captainButtonSelected");
        }
        document.getElementById("captainStatusButtons").classList.remove("hidden");
    } else {
        document.getElementById("captainStatusButtons").classList.add("hidden");
    }
}

function notifyTeamCaptain(gameState) {
    if (!gameState) {
        return;
    }

    if (localStorage.getItem("teamNumber") === "1" && gameState.teamOneCaptain === localStorage.getItem("playerId") ||
        localStorage.getItem("teamNumber") === "2" && gameState.teamTwoCaptain === localStorage.getItem("playerId")) {
        drawSystemChat("chats", "You are the captain now.");
    }
}

function notifyTurn(gameState) {
    if (!gameState) {
        return;
    }

    document.getElementById("turnStatusContainer").classList.remove("turnStatusContainerCorrect");

    if (gameState.turnType === "Welcome") {
        document.getElementById("turnStatusContainer").classList.remove("turnStatusContainerVisible");
        document.getElementById("panelButtons").classList.add("hidden");
        document.getElementById("panelButtons").classList.remove("panelButtonsHighlight");
        drawSystemChat("chats", "Welcome to the Picture Panels game!");
        return;
    }

    if (gameState.turnType === "EndRound") {
        document.getElementById("turnStatusContainer").classList.remove("turnStatusContainerVisible");
        document.getElementById("panelButtons").classList.add("hidden");
        document.getElementById("panelButtons").classList.remove("panelButtonsHighlight");
        document.getElementById("turnStatusMessage").innerHTML = "This round is over.";
        return;
    }

    if (gameState.teamTurn === parseInt(localStorage.getItem("teamNumber"))) {
        switch (gameState.turnType) {
            case "OpenPanel":
                document.getElementById("turnStatusContainer").classList.add("turnStatusContainerVisible");
                highlightTurnStatusContainer();

                document.getElementById("panelButtons").classList.remove("hidden");
                document.getElementById("panelButtons").classList.remove("panelButtonsHighlight");
                document.getElementById("turnStatusMessage").innerHTML = "Vote for a panel to open";
                drawSystemChat("chats", "It's your team's turn to vote for panel(s) you want to open.");
                break;
            case "OpenFreePanel":
                document.getElementById("turnStatusContainer").classList.add("turnStatusContainerVisible");
                highlightTurnStatusContainer();

                document.getElementById("panelButtons").classList.remove("hidden");
                document.getElementById("panelButtons").classList.add("panelButtonsHighlight");
                document.getElementById("turnStatusMessage").innerHTML = "Vote for a free panel to open";
                drawSystemChat("chats", "The other team made an incorrect guess, so vote to open a FREE panel.");
                break;
            case "MakeGuess":
                document.getElementById("turnStatusContainer").classList.add("turnStatusContainerVisible");
                highlightTurnStatusContainer();

                document.getElementById("panelButtons").classList.add("hidden");
                document.getElementById("panelButtons").classList.remove("panelButtonsHighlight");
                if (isCaptain(gameState)) {
                    document.getElementById("turnStatusMessage").innerHTML = "Does your team want to guess?";
                } else {
                    document.getElementById("turnStatusMessage").innerHTML = "Make a guess or pass";
                }
                drawSystemChat("chats", "It's your team's turn to guess or pass.");
                break;
            case "Correct":
                document.getElementById("turnStatusContainer").classList.remove("turnStatusContainerHighlight");
                document.getElementById("turnStatusContainer").classList.add("turnStatusContainerVisible");
                document.getElementById("turnStatusContainer").classList.add("turnStatusContainerCorrect");

                document.getElementById("panelButtons").classList.add("hidden");
                document.getElementById("panelButtons").classList.remove("panelButtonsHighlight");
                document.getElementById("turnStatusMessage").innerHTML = "Your team wins this round!";
                drawSystemChat("chats", "That's the correct answer!");
                break;
        }
    } else {
        switch (gameState.turnType) {
            case "Correct":
                document.getElementById("turnStatusContainer").classList.remove("turnStatusContainerVisible");
                document.getElementById("panelButtons").classList.add("hidden");
                document.getElementById("panelButtons").classList.remove("panelButtonsHighlight");
                break;
            default:
                document.getElementById("turnStatusContainer").classList.remove("turnStatusContainerVisible");
                document.getElementById("panelButtons").classList.add("hidden");
                document.getElementById("panelButtons").classList.remove("panelButtonsHighlight");
                break;
        }
    }
}

function highlightTurnStatusContainer() {
    document.getElementById("turnStatusContainer").classList.remove("turnStatusContainerHighlight");
    setTimeout(function () {
        document.getElementById("turnStatusContainer").classList.add("turnStatusContainerHighlight");
    }, 0);
}

function handleGameState(gameState) {
    loadThemeCss(gameState);

    if (playerIsReadyToPlay && (!currentGameState || currentGameState.turnType !== gameState.turnType || currentGameState.teamTurn !== gameState.teamTurn)) {
        notifyTurn(gameState);
        clearPanelButtonSelection();
    } else if (currentGameState && currentGameState.imageId !== gameState.imageId) {
        clearPanelButtonSelection();
    }

    if (currentGameState &&
        (localStorage.getItem("teamNumber") === "1" && currentGameState.teamOneCaptain !== gameState.teamOneCaptain ||
            localStorage.getItem("teamNumber") === "2" && currentGameState.teamTwoCaptain !== gameState.teamTwoCaptain)) {
        notifyTurn(gameState);
        notifyTeamCaptain(gameState);
    }

    currentGameState = gameState;

    drawGameState(gameState);

    updatePlayerPanelButtons(gameState);

    handleCaptainButtons(gameState);
}

const innerPanels = ["7", "8", "9", "12", "13", "14"];
const outerPanels = ["1", "2", "3", "4", "5", "6", "10", "11", "15", "16", "17", "18", "19", "20"];

function updatePlayerPanelButtons(gameState) {
    if (!gameState) {
        return;
    }

    var disabledPanels = [];

    var teamNumber = localStorage.getItem("teamNumber");
    if (teamNumber === "1") {
        if (gameState.teamOneOuterPanels <= 0) {
            disabledPanels = disabledPanels.concat(outerPanels);
        }
        if (gameState.teamOneInnerPanels <= 0) {
            disabledPanels = disabledPanels.concat(innerPanels);
        }
    } else {
        if (gameState.teamTwoOuterPanels <= 0) {
            disabledPanels = disabledPanels.concat(outerPanels);
        }
        if (gameState.teamTwoInnerPanels <= 0) {
            disabledPanels = disabledPanels.concat(innerPanels);
        }
    }

    if (gameState.turnType === "OpenFreePanel") {
        disabledPanels = innerPanels;
    }

    updatePanelButtons(currentGameState, disabledPanels);
}

async function handleRandomizeTeam(player) {
    clearPanelButtonSelection();

    if (parseInt(localStorage.getItem("teamNumber")) !== player.teamNumber) {
        drawTeam(player.teamNumber);
        await drawChatsAsync("chats");
        drawSystemChat("chats", "The teams have been randomized; you are now on the other team.");
    } else {
        drawSystemChat("chats", "The teams have been randomized; you have not changed teams.");
    }
}

function registerConnections() {
    connection.on("Chat", (player, message) => {
        drawChat("chats", message, player);
    });

    connection.on("Typing", (player) => {
        handleTyping("chats", player);
    });

    connection.on("AddPlayer", (player) => {
        if (player.playerId !== localStorage.getItem("playerId")) {
            drawSystemChat("chats", "has joined the team.", player);
        }
    });

    connection.on("GameState", handleGameState);
    connection.on("RandomizeTeam", handleRandomizeTeam);

    connection.onreconnected = function () {
        if (localStorage.getItem("debug")) {
            drawSystemChat("chats", "SignalR reconnected");
        }
    }

    connection.onclose(async function () {
        if (localStorage.getItem("debug")) {
            drawSystemChat("chats", "SignalR closed.");
        }
        await startSignalRAsync("player");
    });
}

window.onresize = function () {
    var chatsElement = document.getElementById("chats");
    chatsElement.classList.remove("smoothScroll");
    scrollChats("chats", true);
    chatsElement.classList.add("smoothScroll");
}

var connectionCount = 0;

window.onload = async function () {
    var captainGuessButton = document.getElementById("captainGuessButton");
    captainGuessButton.onclick = (event) => {
        putCaptainGuess();
    }
    var captainPassButton = document.getElementById("captainPassButton");
    captainPassButton.onclick = (event) => {
        putCaptainPass();
    }

    drawPanelButtons();
    setupPlayerMenu();

    var promises = [];
    promises.push(getGameStateAsync());
    promises.push(setupPlayerAsync());

    Promise.all(promises).then((results) => {
        handleGameState(results[0]);
    });

    document.getElementById("chooseSmallestTeam").innerHTML = "Choose for me";

    setInterval(putPlayerPingAsync, 30000);
}
