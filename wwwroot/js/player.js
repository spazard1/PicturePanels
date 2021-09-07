async function putStartGameAsync() {
    await fetch("api/gameState/" + localStorage.getItem("gameStateId") + "/" + localStorage.getItem("playerId") + "/start",
        {
            method: "PUT",
        });
}

async function putCancelStartGameAsync() {
    await fetch("api/gameState/" + localStorage.getItem("gameStateId") + "/" + localStorage.getItem("playerId") + "/cancelStart",
        {
            method: "PUT",
        });
}

async function getSmallestTeamAsync() {
    return await fetch("/api/gameState/" + localStorage.getItem("gameStateId") + "/" + localStorage.getItem("playerId") + "/smallestTeam")
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            return;
        });
}

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
        color: initialColor,
        width: Math.ceil(Math.min(250, window.screen.width * .60))
    });

    if (localStorage.getItem("playerName")) {
        document.getElementById("playerNameInput").style.color = initialColor;
        document.getElementById("gameStateId").style.color = initialColor;
    }

    document.getElementById("playerNameInput").oninput = function (event) {
        event.target.style.color = window.colorPicker.color.hslString;
    }

    document.getElementById("gameStateId").oninput = function (event) {
        event.target.style.color = window.colorPicker.color.hslString;
    }

    window.colorPicker.on('color:change', function (color) {
        color.value = 100;
        document.getElementById("playerNameInput").style.color = color.hslString;
        document.getElementById("gameStateId").style.color = color.hslString;
    });

    setupInputDefaultText("playerNameInput", "your name", localStorage.getItem("playerName"));

    setupInputDefaultText("gameStateId", "4-letter game code", localStorage.getItem("gameStateId"));
}

var playerLoaded = false;

function drawPlayer(player) {
    if (player.selectedPanels) {
        var panelButtons = document.getElementsByClassName("panelButton");
        for (var panelButton of panelButtons) {
            if (player.selectedPanels.includes(panelButton.value)) {
                panelButton.classList.add("panelButtonSelected");
            }
        }
    }

    if (player.isAdmin) {
        document.getElementById("playerName").classList.add("adminPlayerName");
    }

    var teamGuessVoteElement = document.getElementById("teamGuessVoteCount_" + player.teamGuessVote);
    if (teamGuessVoteElement) {
        teamGuessVoteElement.classList.add("teamGuessVoteCountChosen");
    }
}

async function putPlayerPingAsync() {
    if (!playerIsReadyToPlay) {
        return;
    }
    
    await fetch("api/players/" + localStorage.getItem("gameStateId") + "/" + localStorage.getItem("playerId") + "/ping",
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            }
        });
}

function promptTeamGuess() {
    bootbox.prompt({
        size: "small",
        title: "What is your guess?",
        backdrop: true,
        closeButton: false,
        callback: function (result) {
            if (result) {
                postTeamGuessAsync(result);
            }
        }
    });
}

async function postTeamGuessAsync(guess) {
    if (!playerIsReadyToPlay) {
        return;
    }

    await fetch("api/teamGuess/" + localStorage.getItem("gameStateId") + "/" + localStorage.getItem("playerId"),
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                Guess: guess
            })
        });
}

async function getTeamGuessesAsync() {
    return await fetch("/api/teamGuess/" + localStorage.getItem("gameStateId") + "/" + localStorage.getItem("playerId"))
        .then(response => response.json())
        .then(responseJson => {
            return responseJson;
        });
}

async function putPlayerReadyAsync() {
    if (!playerIsReadyToPlay) {
        return;
    }

    await fetch("api/players/" + localStorage.getItem("gameStateId") + "/" + localStorage.getItem("playerId") + "/ready",
    {
        method: "PUT"
    });
}

async function getPlayerReadyAsync() {
    return await fetch("api/players/" + localStorage.getItem("gameStateId") + "/" + localStorage.getItem("playerId") + "/ready").then(response => {
        if (response.ok) {
            return response.json();
        }
        return;
    }).then(responseJson => {
        return responseJson;
    });
}

async function deleteTeamGuessAsync(ticks) {
    if (!playerIsReadyToPlay) {
        return;
    }

    await fetch("api/teamGuess/" + localStorage.getItem("gameStateId") + "/" + localStorage.getItem("playerId") + "/" + ticks,
        {
            method: "DELETE"
        });
}

async function putTeamGuessVoteAsync(ticks) {
    if (!playerIsReadyToPlay) {
        return;
    }

    await fetch("api/teamGuess/" + localStorage.getItem("gameStateId") + "/" + localStorage.getItem("playerId") + "/" + ticks,
        {
            method: "PUT"
        }).then((response) => {
            if (response.ok) {
                var teamGuessElements = document.querySelectorAll(".teamGuessVoteCount");
                for (var teamGuessElement of teamGuessElements) {
                    teamGuessElement.classList.remove("teamGuessVoteCountChosen");
                }
                document.getElementById("teamGuessVoteCount_" + ticks).classList.add("teamGuessVoteCountChosen");
            }
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
    document.getElementById("playerHelp").classList.remove("hidden");

    document.getElementById("playerBanner").classList.add("hidden");
    document.getElementById("chooseTeam").classList.add("hidden");
    document.getElementById("teamOneName").classList.add("hidden");
    document.getElementById("teamTwoName").classList.add("hidden");

    document.getElementById("playerName").classList.add("hidden");
    document.getElementById("teamOneName").classList.add("chooseTeamName");
    document.getElementById("teamTwoName").classList.add("chooseTeamName");
    document.getElementById("chooseSmallestTeam").classList.remove("hidden");

    document.getElementById("panelButtons").classList.add("hidden");

    document.getElementById("teamGuessButton").classList.add("hidden");
    document.getElementById("teamGuesses").classList.add("hidden");

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
}

async function choosePlayerNameButtonOnClickAsync() {
    var playerNameInput = document.getElementById("playerNameInput");
    if (playerNameInput.value.length <= 1 || playerNameInput.value === playerNameInput.defaultValue) {
        document.getElementById("playerNameInput").classList.add("playerNameInputDivInvalid");
        return;
    }

    if (document.getElementById("gameStateId").value) {
        localStorage.setItem("gameStateId", document.getElementById("gameStateId").value.toUpperCase());
    }

    playerNameChosen({
        name: document.getElementById("playerNameInput").value,
        color: window.colorPicker.color.hslString
    });

    var gameState = await getGameStateAsync();
    if (gameState) {
        handleGameState(gameState);
    } else {
        return;
    }
}

function playerNameChosen(player) {
    localStorage.setItem("playerName", player.name);
    localStorage.setItem("playerColor", player.color);

    document.getElementById("playerName").innerHTML = player.name;

    document.getElementById("choosePlayerNameLabel").classList.add("hidden");
    document.getElementById("playerNameInputDiv").classList.add("hidden");
    document.getElementById("colorPicker").classList.add("hidden");
    document.getElementById("choosePlayerName").classList.add("hidden");
    document.getElementById("playerHelp").classList.add("hidden");

    document.getElementById("playerBanner").classList.remove("hidden");
    document.getElementById("chooseTeam").classList.remove("hidden");
    document.getElementById("teamOneName").classList.remove("hidden");
    document.getElementById("teamTwoName").classList.remove("hidden");

    setupTeamSelectionButtons();
}

var playerIsReadyToPlay = false;

function teamChosen(teamNumber) {
    localStorage.setItem("teamNumber", teamNumber);
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
    var promises = [];
    promises.push(getGameStateAsync());
    promises.push(getPlayerAsync());

    var results = await Promise.all(promises);
    
    if (shouldPlayerLoadFromCache() && results[0] && results[1]) {
        playerNameChosen({
            name: results[1].name,
            color: results[1].color
        });
        teamChosen(results[1].teamNumber);
        return finalizePlayerAsync();
    } else {
        setupChoosePlayerName();
    }
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
        await smallestTeamChosenAsync();
        await finalizePlayerAsync();
    };
}

async function smallestTeamChosenAsync() {
    document.getElementById("chooseSmallestTeam").innerHTML = "Loading...";

    await getSmallestTeamAsync().then(entity => {
        if (entity) {
            teamChosen(entity.teamNumber);
        } else {
            teamChosen(Math.ceil(Math.random() * 2));
        }
    });
}

function drawTurnType(gameState) {
    if (!gameState) {
        return;
    }

    document.getElementById("turnStatusMessage").classList.remove("turnStatusMessageCorrect");

    switch (gameState.turnType) {
        case "Welcome":

            if (!gameState.turnEndTime) {
                document.getElementById("startGameButton").classList.remove("hidden");
                document.getElementById("cancelStartGameButton").classList.add("hidden");
            } else {
                document.getElementById("startGameButton").classList.add("hidden");
                document.getElementById("cancelStartGameButton").classList.remove("hidden");
            }

            document.getElementById("panelButtons").classList.add("hidden");
            document.getElementById("playerReadyButton").classList.add("hidden");
            document.getElementById("teamGuessButton").classList.add("hidden");
            document.getElementById("teamGuesses").classList.add("hidden");
            document.getElementById("turnStatusMessage").classList.add("opacity0");
            break;
        case "OpenPanel":
            document.getElementById("startGameButton").classList.add("hidden");
            document.getElementById("cancelStartGameButton").classList.add("hidden");

            document.getElementById("teamGuessButton").classList.add("hidden");
            document.getElementById("teamGuesses").classList.add("hidden");

            if (gameState.teamTurn === parseInt(localStorage.getItem("teamNumber"))) {
                document.getElementById("turnStatusMessage").classList.remove("opacity0");
                document.getElementById("turnStatusMessage").innerHTML = "Vote for a panel to open";
                highlightturnStatusMessage();

                document.getElementById("panelButtons").classList.remove("hidden");
                document.getElementById("playerReadyButton").classList.remove("hidden");
            } else {
                document.getElementById("turnStatusMessage").classList.add("opacity0");
                document.getElementById("panelButtons").classList.add("hidden");
                document.getElementById("playerReadyButton").classList.add("hidden");
            }
            break;
        case "MakeGuess":
            document.getElementById("startGameButton").classList.add("hidden");
            document.getElementById("cancelStartGameButton").classList.add("hidden");
            document.getElementById("panelButtons").classList.add("hidden");

            if ((localStorage.getItem("teamNumber") === "1" && gameState.teamOneGuessStatus) ||
                (localStorage.getItem("teamNumber") === "2" && gameState.teamTwoGuessStatus)) {
                document.getElementById("playerReadyButton").classList.add("hidden");
                document.getElementById("teamGuessButton").classList.add("hidden");
                document.getElementById("teamGuesses").classList.add("hidden");
                document.getElementById("turnStatusMessage").classList.add("opacity0");
                drawPlayerReady();
            } else {
                document.getElementById("playerReadyButton").classList.remove("hidden");
                document.getElementById("teamGuessButton").classList.remove("hidden");
                document.getElementById("teamGuesses").classList.remove("hidden");
                document.getElementById("turnStatusMessage").classList.remove("opacity0");
            }

            document.getElementById("turnStatusMessage").innerHTML = "Submit and Vote for Guesses";
            highlightturnStatusMessage();

            break;
        case "GuessesMade":
            document.getElementById("startGameButton").classList.add("hidden");
            document.getElementById("cancelStartGameButton").classList.add("hidden");
            document.getElementById("panelButtons").classList.add("hidden");
            document.getElementById("playerReadyButton").classList.add("hidden");
            document.getElementById("teamGuessButton").classList.add("hidden");
            document.getElementById("teamGuesses").classList.add("hidden");
            document.getElementById("turnStatusMessage").classList.add("opacity0");
            break;
        case "EndRound":
            document.getElementById("startGameButton").classList.add("hidden");
            document.getElementById("cancelStartGameButton").classList.add("hidden");
            document.getElementById("turnStatusMessage").classList.add("opacity0");
            document.getElementById("panelButtons").classList.add("hidden");

            document.getElementById("playerReadyButton").classList.add("hidden");
            document.getElementById("teamGuessButton").classList.add("hidden");
            document.getElementById("teamGuesses").classList.add("hidden");
            document.getElementById("turnStatusMessage").classList.add("opacity0");
            break;
    }
}

function highlightturnStatusMessage() {
    document.getElementById("turnStatusMessage").classList.remove("turnStatusMessageHighlight");
    setTimeout(function () {
        document.getElementById("turnStatusMessage").classList.add("turnStatusMessageHighlight");
    }, 0);
}

function handleGameState(gameState, updateType) {
    loadThemeCss(gameState);

    if (playerIsReadyToPlay && (updateType === "NewTurn" || updateType === "NewRound")) {
        clearPanelButtonSelection();
        drawPlayerReady();
        scrollChats("chats", true);
    }

    drawGameState(gameState);

    if (!playerIsReadyToPlay) {
        return;
    }

    drawTurnType(gameState);

    updatePlayerPanelButtons(gameState);
}

function drawTeamGuesses(teamGuesses) {
    var teamGuessesElement = document.getElementById("teamGuesses");
    teamGuessesElement.innerHTML = "";

    if (!teamGuesses) {
        return;
    }
    
    teamGuesses.forEach(drawTeamGuess);
}

function deleteTeamGuess(teamGuess) {
    document.getElementById("teamGuess_" + teamGuess.ticks).remove();
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

    var teamGuessVoteCountElement = document.createElement("div");
    teamGuessVoteCountElement.id = "teamGuessVoteCount_" + teamGuess.ticks;
    teamGuessVoteCountElement.classList = "teamGuessVoteCount";
    teamGuessVoteCountElement.innerHTML = teamGuess.voteCount;
    teamGuessElement.appendChild(teamGuessVoteCountElement);

    teamGuessElement.appendChild(document.createTextNode(teamGuess.guess));

    var teamGuessDeleteButtonElement = document.createElement("div");
    teamGuessDeleteImageElement = document.createElement("img");
    teamGuessDeleteImageElement.src = "img/x-mark.png";
    teamGuessDeleteButtonElement.appendChild(teamGuessDeleteImageElement);

    teamGuessDeleteButtonElement.onclick = (event) => {
        event.stopPropagation();

        bootbox.confirm({
            size: "small",
            message: "Delete the guess '" + teamGuess.guess + "'?",
            backdrop: true,
            closeButton: false,
            callback: function (result) {
                if (result) {
                    deleteTeamGuessAsync(teamGuess.ticks);
                }
            }
        });
    }

    teamGuessDeleteButtonElement.classList = "teamGuessDeleteButton";
    teamGuessElement.appendChild(teamGuessDeleteButtonElement);

    teamGuessElement.onclick = (event) => {
        event.stopPropagation();
        putTeamGuessVoteAsync(teamGuess.ticks);
    }

    teamGuessesElement.appendChild(teamGuessElement);
}

function voteTeamGuess(oldVote, newVote) {
    updateVoteCount(oldVote, -1);
    updateVoteCount(newVote, 1);
}

function updateVoteCount(ticks, amount) {
    var voteCountElement = document.getElementById("teamGuessVoteCount_" + ticks);
    if (voteCountElement) {
        var currentVoteCount = parseInt(voteCountElement.textContent);
        if (currentVoteCount) {
            voteCountElement.innerHTML = currentVoteCount + amount;
        } else if (amount > 0) {
            voteCountElement.innerHTML = amount;
        } else {
            voteCountElement.innerHTML = "0";
        }
    }
}

const innerPanels = ["7", "8", "9", "12", "13", "14"];
const outerPanels = ["1", "2", "3", "4", "5", "6", "10", "11", "15", "16", "17", "18", "19", "20"];

function updatePlayerPanelButtons(gameState) {
    if (!gameState) {
        return;
    }

    var disabledPanels = [];

    if (localStorage.getItem("teamNumber") === "1") {
        if (gameState.teamOneInnerPanels <= 0) {
            disabledPanels = disabledPanels.concat(innerPanels);
        }
    } else {
        if (gameState.teamTwoInnerPanels <= 0) {
            disabledPanels = disabledPanels.concat(innerPanels);
        }
    }

    updatePanelButtons(gameState, disabledPanels);
}

async function handleRandomizeTeam(player) {
    clearPanelButtonSelection();

    if (parseInt(localStorage.getItem("teamNumber")) !== player.teamNumber) {
        teamChosen(player.teamNumber);
        await finalizePlayerAsync();

        drawSystemChat("chats", { message: "The teams have been randomized; you are now on the other team." });
    } else {
        drawSystemChat("chats", { message: "The teams have been randomized; you have not changed teams." });
    }
}

function drawPlayerReady(player) {
    var playerReadyMessageElement = document.getElementById("playerReadyMessage");
    playerReadyMessageElement.classList.remove("hidden");
    playerReadyMessageElement.innerHTML = "";

    var playerReadyButton = document.getElementById("playerReadyButton");
    if (!player) {
        playerReadyButton.innerHTML = "We are Ready!";
        return;
    }

    if (player.playerId === localStorage.getItem("playerId")) {
        playerReadyButton.innerHTML = "Undo Ready";
        playerReadyMessageElement.appendChild(document.createTextNode("Ready; waiting for confirmation..."));
    } else {
        playerReadyButton.innerHTML = "Confirm!";

        var playerName = document.createElement("span");
        playerName.style = "color: " + player.color + ";";
        playerName.appendChild(document.createTextNode(player.name));
        playerReadyMessageElement.appendChild(playerName);

        playerReadyMessageElement.appendChild(document.createTextNode(" is ready..."));
    }
}

function registerConnections() {
    connection.on("Chat", (chat) => {
        drawChat("chats", chat);
    });

    connection.on("Typing", (player) => {
        handleTyping("chats", player);
    });

    connection.on("AddPlayer", (player) => {
        if (player.playerId !== localStorage.getItem("playerId")) {
            drawSystemChat("chats", { message: "has joined the team.", player: player });
        }
    });

    connection.on("GameState", handleGameState);
    connection.on("AddTeamGuess", drawTeamGuess);
    connection.on("DeleteTeamGuess", deleteTeamGuess);
    connection.on("VoteTeamGuess", voteTeamGuess);
    connection.on("RandomizeTeam", handleRandomizeTeam);
    connection.on("PlayerReady", drawPlayerReady);
}

async function finalizePlayerAsync() {
    await startSignalRAsync("player");
    var player = await putPlayerAsync();

    drawPlayer(player);

    playerIsReadyToPlay = true;
    localStorage.setItem("createdTime", new Date());

    setupChats("chats");

    var promises = [];
    promises.push(getTeamGuessesAsync());
    promises.push(getGameStateAsync());
    promises.push(getPlayerReadyAsync());
    promises.push(drawChatsAsync("chats"));

    var results = await Promise.all(promises);

    drawTeamGuesses(results[0]); // first promise is getTeamGuessesAsync
    handleGameState(results[1]); // second promise is getGameStateAsync
    drawPlayerReady(results[2]); // third promise is getPlayerReadyAsync

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
    sortChats("chats");

    setupPing(putPlayerPingAsync);
}

window.onresize = function () {
    var chatsElement = document.getElementById("chats");
    chatsElement.classList.remove("smoothScroll");
    scrollChats("chats", true);
    chatsElement.classList.add("smoothScroll");
}

window.onload = async function () {
    document.getElementById("teamGuessButton").onclick = (event) => {
        promptTeamGuess();
    }

    document.getElementById("playerReadyButton").onclick = (event) => {
        putPlayerReadyAsync();
    }

    document.getElementById("startGameButton").onclick = (event) => {
        putStartGameAsync();
    }

    document.getElementById("cancelStartGameButton").onclick = (event) => {
        putCancelStartGameAsync();
    }

    drawPanelButtons();
    setupPlayerMenu();
    setupPlayerAsync();
}
