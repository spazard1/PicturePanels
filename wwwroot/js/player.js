﻿async function panelButtonOnClick(event) {
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
        color: initialColor,
        width: Math.ceil(Math.min(300, window.screen.width * .65))
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

async function postTeamGuessAsync() {
    if (!playerIsReadyToPlay) {
        return;
    }

    await fetch("api/teamGuess/" + localStorage.getItem("teamNumber"),
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                Guess: document.getElementById("chats_inputText").value
            })
        }).then(() => {
            document.getElementById("chats_inputText").value = "";
        });
}

async function getTeamGuessesAsync() {
    return await fetch("/api/teamGuess/" + localStorage.getItem("teamNumber"))
        .then(response => response.json())
        .then(responseJson => {
            return responseJson;
        });
}

async function deleteTeamGuessAsync(ticks) {
    if (!playerIsReadyToPlay) {
        return;
    }

    await fetch("api/teamGuess/" + localStorage.getItem("teamNumber") + "/" + ticks,
        {
            method: "DELETE"
        });
}

function setupChoosePlayerName() {
    playerIsReadyToPlay = false;
    document.getElementById("chooseSmallestTeam").innerHTML = "Choose for me";

    document.getElementById("turnStatusMessage").classList.add("hidden");

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
    document.getElementById("turnStatusMessage").onclick = null;

    document.getElementById("teamOneName").classList.remove("teamOneColor");
    document.getElementById("teamOneName").classList.add("teamOneBox");

    document.getElementById("teamTwoName").classList.remove("teamTwoColor");
    document.getElementById("teamTwoName").classList.add("teamTwoBox");

    document.getElementById("teamGuessesContainer").classList.add("hidden");
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
    playerIsReadyToPlay = true;

    handleGameState(await getGameStateAsync());

    var promises = [];
    promises.push(putPlayerAsync());
    promises.push(getTeamGuessesAsync());
    promises.push(startSignalRAsync("player"));
    promises.push(drawChatsAsync("chats"));

    var results = await Promise.all(promises);

    drawPlayer(results[0]); // first promise is putPlayer
    drawTeamGuesses(results[1]); // second promise is getTeamGuessesAsync

    document.getElementById("playerBanner").onclick = (event) => {
        var result = confirm("Do you want to change your player name, color, or team?");
        if (!result) {
            return;
        }
        setupChoosePlayerName();
    };

    document.getElementById("turnStatusMessage").onclick = (event) => {
        var result = confirm("Do you want to change your player name, color, or team?");
        if (!result) {
            return;
        }
        setupChoosePlayerName();
    };

    scrollChats("chats", true);
}

function setupTeamSelectionButtons() {
    document.getElementById("teamOneName").onclick = async function () {
        teamChosen(1);
        await finalizePlayerAsync();
    };
    document.getElementById("teamTwoName").onclick = async function () {
        teamChosen(2);
        await finalizePlayerAsync();
    };
    document.getElementById("chooseSmallestTeam").onclick = async function () {
        await chooseSmallestTeam();
        await finalizePlayerAsync();
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

    document.getElementById("turnStatusMessage").classList.remove("hidden");

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

function drawTurnType(gameState) {
    if (!gameState) {
        return;
    }

    document.getElementById("turnStatusMessage").classList.remove("turnStatusMessageCorrect");
    document.getElementById("teamGuessesInputContainer").classList.add("hidden");
    document.getElementById("teamGuesses").classList.add("hidden");

    if (gameState.turnType === "Welcome") {
        document.getElementById("turnStatusMessage").classList.remove("turnStatusMessageVisible");
        document.getElementById("panelButtons").classList.add("hidden");
        document.getElementById("panelButtons").classList.remove("panelButtonsHighlight");
        return;
    }

    if (gameState.turnType === "EndRound") {
        document.getElementById("turnStatusMessage").classList.remove("turnStatusMessageVisible");
        document.getElementById("panelButtons").classList.add("hidden");
        document.getElementById("panelButtons").classList.remove("panelButtonsHighlight");
        document.getElementById("turnStatusMessage").innerHTML = "This round is over.";
        return;
    }

    /*
    if (gameState.turnType !== "MakeGuess") {
        var teamGuessInputElement = document.getElementById("teamGuessInput");
        teamGuessInputElement.value = "";

        if ("createEvent" in document) {
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent("change", false, true);
            teamGuessInputElement.dispatchEvent(evt);
        }
        else {
            teamGuessInputElement.fireEvent("onchange");
        }
    }
    */

    switch (gameState.turnType) {
        case "OpenPanel":
            if (gameState.teamTurn === parseInt(localStorage.getItem("teamNumber"))) {
                document.getElementById("turnStatusMessage").classList.add("turnStatusMessageVisible");
                highlightturnStatusMessage();

                document.getElementById("panelButtons").classList.remove("hidden");
                document.getElementById("panelButtons").classList.remove("panelButtonsHighlight");
                document.getElementById("turnStatusMessage").innerHTML = "Vote for a panel to open";
            } else {
                document.getElementById("turnStatusMessage").classList.remove("turnStatusMessageVisible");
                document.getElementById("panelButtons").classList.add("hidden");
                document.getElementById("panelButtons").classList.remove("panelButtonsHighlight");
            }
            break;
        case "MakeGuess":
            document.getElementById("teamGuessesInputContainer").classList.remove("hidden");
            document.getElementById("teamGuesses").classList.remove("hidden");

            document.getElementById("panelButtons").classList.add("hidden");
            document.getElementById("panelButtons").classList.remove("panelButtonsHighlight");

            document.getElementById("turnStatusMessage").classList.add("turnStatusMessageVisible");
            document.getElementById("turnStatusMessage").innerHTML = "Make your guess or pass";
            highlightturnStatusMessage();

            break;
        case "GuessesMade":
            document.getElementById("turnStatusMessage").classList.remove("turnStatusMessageVisible");
            break;
    }
}

function highlightturnStatusMessage() {
    document.getElementById("turnStatusMessage").classList.remove("turnStatusMessageHighlight");
    setTimeout(function () {
        document.getElementById("turnStatusMessage").classList.add("turnStatusMessageHighlight");
    }, 0);
}

function handleGameState(gameState) {
    loadThemeCss(gameState);

    if (playerIsReadyToPlay && (!currentGameState || currentGameState.turnType !== gameState.turnType || currentGameState.teamTurn !== gameState.teamTurn)) {
        clearPanelButtonSelection();
    } else if (currentGameState && currentGameState.imageId !== gameState.imageId) {
        clearPanelButtonSelection();
    }

    currentGameState = gameState;

    drawGameState(gameState);

    if (!playerIsReadyToPlay) {
        return;
    }

    drawTurnType(gameState);

    updatePlayerPanelButtons(gameState);

    if (gameState.turnType === "Welcome") {
        drawSystemChat("chats", "Welcome to the Picture Panels game!");
        return;
    }
}

function drawTeamGuesses(teamGuesses) {
    var teamGuessesElement = document.getElementById("teamGuesses");

    teamGuessesElement.innerHTML = "";
    teamGuesses.forEach(drawTeamGuess);
}

function deleteTeamGuess(ticks) {
    document.getElementById("teamGuess_" + ticks).remove();
}

function drawTeamGuess(teamGuess) {
    var teamGuessesElement = document.getElementById("teamGuesses");

    var teamGuessElement = document.createElement("div");
    teamGuessElement.id = "teamGuess_" + teamGuess.ticks;
    teamGuessElement.classList = "teamGuessText";
    if (localStorage.getItem("teamNumber") === "1") {
        teamGuessElement.classList.add("teamOneDarkColorBackground");
    } else {
        teamGuessElement.classList.add("teamTwoDarkColorBackground");
    }
    teamGuessElement.appendChild(document.createTextNode(teamGuess.guess));

    var teamGuessDeleteButtonElement = document.createElement("div");
    teamGuessDeleteImageElement = document.createElement("img");
    teamGuessDeleteImageElement.src = "img/x-mark.png";
    teamGuessDeleteButtonElement.appendChild(teamGuessDeleteImageElement);

    teamGuessDeleteButtonElement.onclick = (event) => {
        var result = confirm("Delete the guess '" + teamGuess.guess + "'?");
        if (!result) {
            return;
        }

        deleteTeamGuessAsync(teamGuess.ticks);
    }

    teamGuessDeleteButtonElement.classList = "teamGuessDeleteButton";
    teamGuessElement.appendChild(teamGuessDeleteButtonElement);

    teamGuessesElement.appendChild(teamGuessElement);
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
        if (gameState.teamOneInnerPanels <= 0) {
            disabledPanels = disabledPanels.concat(innerPanels);
        }
    } else {
        if (gameState.teamTwoInnerPanels <= 0) {
            disabledPanels = disabledPanels.concat(innerPanels);
        }
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
    connection.on("AddTeamGuess", drawTeamGuess);
    connection.on("DeleteTeamGuess", deleteTeamGuess);
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
    handleGameState(await getGameStateAsync());

    var teamGuessesButton = document.getElementById("teamGuessesButton");
    teamGuessesButton.onclick = (event) => {
        postTeamGuessAsync();
    }

    drawPanelButtons();
    setupPlayerMenu();
    setupPlayerAsync()

    document.getElementById("chooseSmallestTeam").innerHTML = "Choose for me";

    setInterval(putPlayerPingAsync, 30000);
}
