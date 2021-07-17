var maxMostVotesPanels = 3;

function createPanels() {
    var panelNumber = 1;

    var panelsElement = document.getElementById("panels");
    for (var i = 0; i < down; i++) {
        for (var j = 0; j < across; j++) {
            var panelElement = document.createElement("div");
            panelElement.classList.add("panel");
            panelElement.id = "panel_" + panelNumber;
            panelElement.panelNumber = "" + panelNumber;
            panelElement.value = panelNumber + "";

            var panelBackgroundElement = document.createElement("div");
            panelBackgroundElement.classList.add("panelBackground");
            panelElement.appendChild(panelBackgroundElement);

            var panelNumberElement = document.createElement("div");
            panelNumberElement.id = "panelNumber_" + panelNumber;
            panelNumberElement.classList.add("panelNumber");
            panelNumberElement.appendChild(document.createTextNode(panelNumber));
            panelBackgroundElement.appendChild(panelNumberElement);

            var panelImageElement = document.createElement("img");
            panelImageElement.classList.add("panelImage");
            panelElement.appendChild(panelImageElement);

            panelsElement.appendChild(panelElement);
            panelNumber++;
        }
    }

    var mostVotesPanelsElement = document.getElementById("mostVotesPanels");

    for (var i = 0; i < maxMostVotesPanels; i++) {
        var mostVotesPanelElement = document.createElement("div");
        mostVotesPanelElement.classList.add("mostVotesPanel");
        mostVotesPanelElement.classList.add("opacity0");

        var mostVotesPanelImageElement = document.createElement("img");
        mostVotesPanelImageElement.classList.add("panelImage");
        mostVotesPanelElement.appendChild(mostVotesPanelImageElement);

        mostVotesPanelsElement.appendChild(mostVotesPanelElement);
    }
}

async function resetPanelsAsync(gameState) {
    var imagePromises = [];
    var panels = document.getElementsByClassName("panel");

    for (let panel of panels) {
        panel.classList.remove("panelOpen");
        imagePromises.push(loadImageAsync(panel.lastChild, "/api/images/panels/" + gameState.imageId + "/0"));
    }

    var mostVotesPanelElements = document.getElementsByClassName("mostVotesPanel");
    for (let mostVotesPanelElement of mostVotesPanelElements) {
        mostVotesPanelElement.classList.add("opacity0");
        imagePromises.push(loadImageAsync(mostVotesPanelElement.lastChild, "/api/images/panels/" + gameState.imageId + "/0"));
    }

    await Promise.all(imagePromises);

    resizePanelContainer();
}

function resizePanelContainer() {
    var panelsContainer = document.getElementById('panels');
    panelsContainer.style.maxWidth = "";

    var panelsContainerRect = panelsContainer.getBoundingClientRect();
    var panelsContainerMaxWidth = 83;
    var paddingBottom = 5;

    while (panelsContainerRect.height + panelsContainerRect.y >= (window.innerHeight - paddingBottom)) {
        panelsContainerMaxWidth -= .5;
        if (panelsContainerMaxWidth < 10) {
            break;
        }

        panelsContainer.style.maxWidth = panelsContainerMaxWidth + "vw";
        panelsContainerRect = panelsContainer.getBoundingClientRect();
    }
}

var playerSelectedPanels = {};

function updatePlayer(player) {
    var playerElement = document.getElementById("player_" + player.playerId);
    if (!playerElement) {
        playerElement = document.createElement("div");
        playerElement.classList = "teamPlayerName";
        playerElement.id = "player_" + player.playerId;
        playerElement.playerId = player.playerId;
    }
    playerElement.innerHTML = player.name;
    playerElement.style.borderColor = player.color;

    if ((player.playerId === currentGameState.teamOneCaptain && player.teamNumber === 1) ||
        (player.playerId === currentGameState.teamTwoCaptain && player.teamNumber === 2)) {
        playerElement.classList.add("teamPlayerNameCaptain");
    } else {
        playerElement.classList.remove("teamPlayerNameCaptain");
    }

    var parent = null;
    
    playerSelectedPanels[player.playerId] = player;

    if (player.teamNumber === 1) {
        parent = document.getElementById("teamOnePlayerNames");
    } else {
        parent = document.getElementById("teamTwoPlayerNames");
    }
    if (parent !== playerElement.parentNode) {
        parent.appendChild(playerElement);
    }

    setPlayerFuzzies(player);

    updatePlayerDots(player);
}

var middleXOffset = .2;
var middleYOffset = .25;
var playerFuzzies = {};

function setPlayerFuzzies(player) {
    if (playerFuzzies[player.playerId]) {
        return;
    }

    playerFuzzies[player.playerId] = {};

    if (Math.random() < .5) {
        playerFuzzies[player.playerId].fuzzX = Math.random();

        // check if this number falls inside the middle range
        if (playerFuzzies[player.playerId].fuzzX < (.5 + middleXOffset) && playerFuzzies[player.playerId].fuzzX > (.5 - middleXOffset)) {
            // generate a random number on the first-half (.5) of the panel, but use the entire valid range of the panel (offset is only half of the offset, so multiply by 2).
            playerFuzzies[player.playerId].fuzzY = .5 * Math.random() * (1 - middleYOffset * 2);
            if (Math.random() < .5) {
                // half of the time, choose the other side of the panel instead (.5), + the offset to get to the end of the panel
                playerFuzzies[player.playerId].fuzzY = .5 + middleYOffset + playerFuzzies[player.playerId].fuzzY;
            }
        } else {
            playerFuzzies[player.playerId].fuzzY = Math.random();
        }
    } else {
        playerFuzzies[player.playerId].fuzzY = Math.random();

        if (playerFuzzies[player.playerId].fuzzY < (.5 + middleYOffset) && playerFuzzies[player.playerId].fuzzY > (.5 - middleYOffset)) {
            playerFuzzies[player.playerId].fuzzX = .5 * Math.random() * (1 - middleXOffset * 2);
            if (Math.random() < .5) {
                playerFuzzies[player.playerId].fuzzX = .5 + middleXOffset + playerFuzzies[player.playerId].fuzzX;
            }
        } else {
            playerFuzzies[player.playerId].fuzzX = Math.random();
        }
    }
}

function drawMostVotesPanels(resetPanels) {
    if (resetPanels) {
        resetMaxVotesPanels();
    }

    var mostVotesPanelElements = document.getElementsByClassName("mostVotesPanel");

    if (currentGameState.turnType !== "OpenPanel" &&
        currentGameState.turnType !== "OpenFreePanel") {
        for (let mostVotesPanelElement of mostVotesPanelElements) {
            mostVotesPanelElement.classList.add("opacity0");
        }
        return;
    }

    var panelVotes = {};
    for (var i = 1; i <= across * down; i++) {
        panelVotes[i + ""] = 0;
    }

    for (const playerId in playerSelectedPanels) {
        if (playerSelectedPanels[playerId].teamNumber !== currentGameState.teamTurn) {
            continue;
        }
        playerSelectedPanels[playerId].selectedPanels.forEach(panel => {
            panelVotes[panel]++;
        });
    }

    var mostVotes = 0;
    var mostVotesPanels = [];

    for (const panel in panelVotes) {
        var panelElement = document.getElementById("panel_" + panel);
        if (panelElement.classList.contains("panelOpen")) {
            continue;
        }

        if (panelVotes[panel] > mostVotes) {
            mostVotes = panelVotes[panel];
            mostVotesPanels = [panel];
        } else if (panelVotes[panel] === mostVotes) {
            mostVotesPanels.push(panel);
        }
    }

    var mostVotesPanelElements = document.getElementsByClassName("mostVotesPanel");
    if (mostVotes === 0 || mostVotesPanels.length > maxMostVotesPanels) {
        for (let mostVotesPanelElement of mostVotesPanelElements) {
            mostVotesPanelElement.classList.add("opacity0");
        }
    } else {
        for (let i = 0; i < maxMostVotesPanels; i++) {
            if (mostVotesPanels.length > i) {
                var panelElement = document.getElementById("panel_" + mostVotesPanels[i]);
                var panelElementRect = panelElement.getBoundingClientRect();
                mostVotesPanelElements[i].classList.remove("opacity0");
                mostVotesPanelElements[i].style.transform = "translate(" + panelElementRect.x + "px," + panelElementRect.y + "px)";
                mostVotesPanelElements[i].style.width = panelElementRect.width + "px";
                mostVotesPanelElements[i].style.height = panelElementRect.height + "px";
            } else {
                mostVotesPanelElements[i].classList.add("opacity0");
            }
        }
    }
}

function drawTeamStatus(gameState, resetTimer) {
    if (gameState.teamTurn === 1) {
        document.getElementById("teamOneDiv").classList.add("activeTeam");
        document.getElementById("teamTwoDiv").classList.remove("activeTeam");
    } else {
        document.getElementById("teamOneDiv").classList.remove("activeTeam");
        document.getElementById("teamTwoDiv").classList.add("activeTeam");
    }

    var teamOneStatus = document.getElementById("teamOneStatus");
    var teamTwoStatus = document.getElementById("teamTwoStatus");

    if (gameState.turnType === "Welcome") {
        teamOneStatus.innerHTML = "";
        teamTwoStatus.innerHTML = "";
        stopCountdown("teamOneCountdownCanvas");
        stopCountdown("teamTwoCountdownCanvas");
        return;
    } else if (gameState.turnType === "Correct" ||
        gameState.turnType === "EndRound") {
        stopCountdown("teamOneCountdownCanvas");
        stopCountdown("teamTwoCountdownCanvas");
    }

    if (gameState.teamTurn === 1) {
        drawRoundNumber(gameState, teamTwoStatus);
        if (resetTimer) {
            stopCountdown("teamTwoCountdownCanvas");
        }

        switch (gameState.turnType) {
            case "OpenPanel":
                teamOneStatus.innerHTML = "Open Panel &rarr;";
                if (resetTimer) {
                    startCountdown("teamOneCountdownCanvas", gameState.openPanelTime);
                }
                break;
            case "OpenFreePanel":
                teamOneStatus.innerHTML = "Open Free Panel &rarr;";
                if (resetTimer) {
                    startCountdown("teamOneCountdownCanvas", gameState.openPanelTime);
                }
                break;
            case "MakeGuess":
                if (gameState.captainStatus === "Guess") {
                    teamOneStatus.innerHTML = "Ready to Guess!";
                } else if (gameState.captainStatus === "Pass") {
                    teamOneStatus.innerHTML = "Team has passed.";
                } else {
                    teamOneStatus.innerHTML = "Guess or Pass &rarr;";
                }
                if (resetTimer) {
                    startCountdown("teamOneCountdownCanvas", gameState.guessTime);
                }
                break;
            case "Correct":
                teamOneStatus.innerHTML = "Correct! &rarr;";
                break;
            case "EndRound":
                teamOneStatus.innerHTML = "End of Round";
                break;
            default:
                teamOneStatus.innerHTML = gameState.turnType;
                break;
        }
    } else {
        drawRoundNumber(gameState, teamOneStatus);
        if (resetTimer) {
            stopCountdown("teamOneCountdownCanvas");
        }

        switch (gameState.turnType) {
            case "OpenPanel":
                teamTwoStatus.innerHTML = "&larr; Open Panel";
                if (resetTimer) {
                    startCountdown("teamTwoCountdownCanvas", gameState.openPanelTime);
                }
                break;
            case "OpenFreePanel":
                teamTwoStatus.innerHTML = "&larr; Open Free Panel";
                if (resetTimer) {
                    startCountdown("teamTwoCountdownCanvas", gameState.openPanelTime);
                }
                break;
            case "MakeGuess":
                if (gameState.captainStatus === "Guess") {
                    teamTwoStatus.innerHTML = "Ready to Guess!";
                } else if (gameState.captainStatus === "Pass") {
                    teamTwoStatus.innerHTML = "Team has passed.";
                } else {
                    teamTwoStatus.innerHTML = "&larr; Guess or Pass";
                }
                if (resetTimer) {
                    startCountdown("teamTwoCountdownCanvas", gameState.guessTime);
                }
                break;
            case "Correct":
                teamTwoStatus.innerHTML = "&larr; Correct!";
                break;
            case "EndRound":
                teamTwoStatus.innerHTML = "End of Round";
                break;
            default:
                teamTwoStatus.innerHTML = gameState.turnType;
                break;
        }
    }
}

function setupCanvases() {
    var canvases = document.getElementsByClassName("countdownCanvas");

    for (let canvas of canvases) {
        var ctx = canvas.getContext("2d");
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        var canvasSize = Math.floor(canvas.scrollHeight);
        canvas.style.height = canvasSize + "px";
        canvas.style.width = canvasSize + "px";
        canvas.height = canvasSize * window.devicePixelRatio;
        canvas.width = canvasSize * window.devicePixelRatio;
        
        var circlePosition = Math.floor(canvasSize / 2) * window.devicePixelRatio;

        ctx.translate(circlePosition, circlePosition); // First translate the context to the center you wish to rotate around.
        ctx.rotate(1.5 * Math.PI); // Then do the actual rotation.
        ctx.translate(-circlePosition, -circlePosition); // Then translate the context back.
    }
}

var countdownInterval;
var framerate = 20;

function startCountdown(canvasId, countdownMax) {
    if (countdownMax <= 0) {
        return;
    }

    countdown = countdownMax;
    clearInterval(countdownInterval);

    countdownInterval = setInterval(function () {
        countdown -= 1 / framerate; 
        drawCountdown(canvasId, countdown, countdownMax);

        if (countdown <= 0) {
            clearInterval(countdownInterval);
        }

    }, 1000 / framerate);
}

function stopCountdown(canvasId) {
    clearInterval(countdownInterval);
    drawCountdown(canvasId, 0);
}

function drawCountdown(canvasId, countdown, countdownMax) {
    var canvas = document.getElementById(canvasId);
    var ctx = canvas.getContext("2d");

    var scale = .5;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (countdown <= 0) {
        return;
    }

    var strokeWidth = Math.ceil(canvas.height / 20);
    var circleSize = (canvas.height / 2) * scale;
    var circlePosition = canvas.height / 2;

    ctx.beginPath();
    ctx.arc(circlePosition, circlePosition, circleSize, 0, (countdown / countdownMax) * 2 * Math.PI);
    ctx.strokeStyle = "white";
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
}

function drawRoundNumber(gameState, element) {
    element.innerHTML = "Round " + gameState.roundNumber;
}

function setClassStyle(className, styleFunc) {
    for (let i = 0; i < document.styleSheets.length; i++) {
        if (document.styleSheets[i].href.endsWith("gameboard.css")) {
            var cssRules = document.styleSheets[i].cssRules;
            for (let j = 0; j < cssRules.length; j++) {
                if (cssRules[j].selectorText === className) {
                    styleFunc(cssRules[j]);
                }
            }
        }
    }
}

function hideMostVotesPanels() {
    setClassStyle(".mostVotesPanel", (element) => {
        element.style.opacity = 0;
    });
}

function hidePlayerDots(panelNumber) {
    if (panelNumber) {
        var playerDotDivs = document.getElementsByClassName("playerDot_panelNumber_" + panelNumber);
        for (let playerDotDiv of playerDotDivs) {
            playerDotDiv.classList.add("opacity0");
        }
    } else {
        setClassStyle(".playerDot", (element) => {
            element.style.opacity = 0;
        });
    }
}

function drawPlayerDots(player) {
    var panels = document.getElementsByClassName("panel");

    for (var i = 1; i <= across * down; i++) {
        var playerDotDiv = document.getElementById("playerDot_" + player.playerId + "_" + i);
        if (playerDotDiv) {
            drawPlayerDot(panels, playerDotDiv, currentGameState);
        }
    }
}

function drawAllPlayerDots(gameState, resetDots) {
    if (resetDots) {
        resetPlayerDots();
    }

    var playerDotDivs = document.getElementsByClassName("playerDot");
    var panels = document.getElementsByClassName("panel");

    for (let playerDotDiv of playerDotDivs) {
        drawPlayerDot(panels, playerDotDiv, gameState);
    }
}

function drawPlayerDot(panels, playerDotDiv, gameState) {
    if (playerSelectedPanels[playerDotDiv.player.playerId] &&
        playerSelectedPanels[playerDotDiv.player.playerId].selectedPanels.includes(playerDotDiv.panelNumber + "") &&
        playerDotDiv.player.teamNumber === currentGameState.teamTurn &&
        !panels[playerDotDiv.panelNumber - 1].classList.contains("panelOpen") &&
        (gameState.turnType === "OpenPanel" ||  gameState.turnType === "OpenFreePanel")) {
        movePlayerDotToPanel(playerDotDiv);
    } else {
        movePlayerDotToPlayer(playerDotDiv);
    }
}

function updatePlayerDots(player) {
    for (var i = 1; i <= across * down; i++) {
        var playerDotDiv = document.getElementById("playerDot_" + player.playerId + "_" + i);
        if (!playerDotDiv) {
            playerDotDiv = createPlayerDot(player, i);
        }

        playerDotDiv.style.fill = player.color;
        playerDotDiv.player = player;

        if (player.name) {
            var spaceIndex = player.name.trim().indexOf(" ");
            if (spaceIndex > 0) {
                document.getElementById("playerDotInitials_" + player.playerId + "_" + i).innerHTML = player.name.charAt(0) + player.name.charAt(spaceIndex + 1);
            } else {
                document.getElementById("playerDotInitials_" + player.playerId + "_" + i).innerHTML = player.name.substring(0, 2);
            }
        }
    }
}

function createPlayerDot(player, panelNumber) {
    var playerElement = document.getElementById("player_" + player.playerId);
    playerElementRect = playerElement.getBoundingClientRect();

    var scale = 1.1;
    var circleSize = Math.ceil(playerElementRect.height * scale);

    var playerDotDiv = document.createElement("div");
    playerDotDiv.id = "playerDot_" + player.playerId + "_" + panelNumber;
    playerDotDiv.player = player;
    playerDotDiv.panelNumber = panelNumber;
    playerDotDiv.style.width = circleSize + "px";
    playerDotDiv.style.height = circleSize + "px";

    playerDotDiv.classList.add("playerDot_panelNumber_" + panelNumber);
    playerDotDiv.classList.add("playerDot");
    playerDotDiv.classList.add("opacity0");
    playerDotDiv.classList.add("playerDot_" + player.playerId);
    document.body.appendChild(playerDotDiv);

    var playerDotSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    var playerDotInitials = document.createElement("div");
    playerDotInitials.id = "playerDotInitials_" + player.playerId + "_" + panelNumber;

    var playerDotCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    playerDotCircle.setAttribute("r", Math.max(1, circleSize / 2 - 2));
    playerDotCircle.setAttribute("cx", circleSize / 2);
    playerDotCircle.setAttribute("cy", circleSize / 2);
    playerDotCircle.setAttribute("stroke", "black");
    playerDotCircle.setAttribute("stroke-width", 2);

    playerDotSvg.appendChild(playerDotCircle);
    playerDotDiv.appendChild(playerDotSvg);
    playerDotDiv.appendChild(playerDotInitials);

    var zindex = Math.ceil(Math.random() * 500) + 100;
    playerDotDiv.style.zIndex = zindex;

    return playerDotDiv;
}

function random(lower, upper) {
    return Math.floor((Math.random() * (upper - lower)) + lower);
}

function resetPlayerDots() {
    var playerDotDivs = document.getElementsByClassName("playerDot");

    for (let playerDotDiv of playerDotDivs) {
        playerDotDiv.player.selectedPanels = [];
        playerDotDiv.classList.add("opacity0");
        movePlayerDotToPlayer(playerDotDiv);
    }

    setClassStyle(".playerDot", (element) => {
        element.style.removeProperty("opacity");
    });
}

function movePlayerDotToPlayer(playerDotDiv) {
    var playerElement = document.getElementById("player_" + playerDotDiv.player.playerId);
    if (!playerElement) {
        playerDotDiv.remove();
        return;
    }
    var playerElementRect = playerElement.getBoundingClientRect();

    playerDotDiv.style.transform = "translate(" + playerElementRect.x + "px," + playerElementRect.y + "px)";
    playerDotDiv.style.zIndex = Math.ceil(Math.random() * 500) + 100;
    playerDotDiv.classList.add("opacity0");
}

function movePlayerDotToPanel(playerDotDiv) {
    var playerDotDiv = document.getElementById("playerDot_" + playerDotDiv.player.playerId + "_" + playerDotDiv.panelNumber);

    var panelRect = document.getElementById("panel_" + playerDotDiv.panelNumber).getBoundingClientRect();
    var playerDotDivRect = playerDotDiv.getBoundingClientRect();

    var x = (panelRect.right - panelRect.left - playerDotDivRect.width) * Math.abs(playerFuzzies[playerDotDiv.player.playerId].fuzzX) + panelRect.left;
    var y = (panelRect.bottom - panelRect.top - playerDotDivRect.height) * Math.abs(playerFuzzies[playerDotDiv.player.playerId].fuzzY) + panelRect.top;
    
    playerDotDiv.style.transform = "translate(" + x + "px," + y + "px)";
    playerDotDiv.classList.remove("opacity0");
}

function resetMaxVotesPanels() {
    playerSelectedPanels = {};

    setClassStyle(".mostVotesPanel", (element) => {
        element.style.removeProperty("opacity");
    });
}

function openAllPanels() {
    hidePlayerDots();
    hideMostVotesPanels();

    var panels = document.getElementsByClassName("panel");
    var panelCount = 1;

    var panelsArray = [];
    for (let panel of panels) {
        panelsArray.push(panel);
    }
    shuffle(panelsArray);
    panelsArray.forEach(function (panel) {
        if (!panel.classList.contains("panelOpen")) {
            loadImageAsync(panel.lastChild, "/api/images/panels/" + currentGameState.imageId + "/" + panel.panelNumber).then(() => {
                panel.classList.add("panelOpen");
            });
        }
    });
}

var allPlayers = [];

function drawCaptains() {
    var playerNameElements = document.getElementsByClassName("teamPlayerName");
    for (let playerNameElement of playerNameElements) {
        if (playerNameElement.playerId === currentGameState.teamOneCaptain ||
            playerNameElement.playerId === currentGameState.teamTwoCaptain) {
            playerNameElement.classList.add("teamPlayerNameCaptain");
        } else {
            playerNameElement.classList.remove("teamPlayerNameCaptain");
        }
    }
}

async function drawRevealedPanelsAsync(gameState) {
    var promises = [];

    if (gameState.turnType === "Correct" || gameState.turnType === "EndRound") {
        openAllPanels();
        return;
    }

    var panels = document.getElementsByClassName("panel");
    for (let panel of panels) {
        var panelImage = panel.lastChild;

        if (gameState.revealedPanels.includes(panel.panelNumber)) {
            promises.push(loadImageAsync(panelImage, "/api/images/panels/" + gameState.imageId + "/" + panel.panelNumber).then(() => {
                panel.classList.add("panelOpen");
                hidePlayerDots(panel.panelNumber);
            }));
        } else {
            panel.classList.remove("panelOpen");
            panelImage.src = "/api/images/panels/" + gameState.imageId + "/0";
        }
    }

    await Promise.all(promises);
}

function drawIncorrectGuesses(gameState) {
    if (gameState.teamOneIncorrectGuesses <= 5) {
        document.getElementById("teamOneIncorrectGuessesDiv").innerHTML = "&olcross;".repeat(gameState.teamOneIncorrectGuesses);
    } else {
        document.getElementById("teamOneIncorrectGuessesDiv").innerHTML = gameState.teamOneIncorrectGuesses + " &olcross;";
    }
    if (gameState.teamTwoIncorrectGuesses <= 5) {
        document.getElementById("teamTwoIncorrectGuessesDiv").innerHTML = "&olcross;".repeat(gameState.teamTwoIncorrectGuesses);
    } else {
        document.getElementById("teamTwoIncorrectGuessesDiv").innerHTML = gameState.teamTwoIncorrectGuesses + " &olcross;";
    }
}

function setupWelcomeAnimationAsync() {
    var promises = [];
    var panels = document.getElementsByClassName("panel");

    for (let panel of panels) {
        panel.classList.remove("panelOpen");
        promises.push(loadImageAsync(panel.lastChild, "/api/images/panels/welcome/" + panel.panelNumber));
    }

    return Promise.all(promises);
}

var welcomeAnimationTimeout;
var previousRandomIndex = -1;
function drawWelcomeAnimation() {
    hidePlayerDots();
    hideMostVotesPanels();

    var panels = document.getElementsByClassName("panel");

    var panelsArray = [];
    for (let panel of panels) {
        panelsArray.push(panel);
    }

    do {
        var randomIndex = Math.floor(Math.random() * panelsArray.length);
    } while (randomIndex === previousRandomIndex)
    previousRandomIndex = randomIndex;

    var panel = panelsArray[randomIndex];

    if (panel.classList.contains("panelOpen")) {
        panel.classList.remove("panelOpen");
    } else {
        panel.classList.add("panelOpen");
    }
}

function stopWelcomeAnimation() {
    document.getElementById("welcome").classList.add("hidden");

    clearInterval(welcomeAnimationTimeout);
    welcomeAnimationTimeout = null;
}

async function handleGameState(gameState, firstLoad) {
    loadThemeCss(gameState);

    if (gameState.turnType === "Welcome") {
        await setupWelcomeAnimationAsync();

        if (!welcomeAnimationTimeout) {
            welcomeAnimationTimeout = setInterval(drawWelcomeAnimation, 1500);
        }

        document.getElementById("welcome").classList.remove("hidden");
        gameState.imageId = "welcome";
        drawGameState(gameState);
        resizePanelContainer();

        return;
    }

    if (firstLoad || gameState.imageId !== currentGameState.imageId) {
        await resetPanelsAsync(gameState);
    }

    stopWelcomeAnimation();

    var isNewTurn = gameState.turnType !== currentGameState.turnType ||
        gameState.teamTurn !== currentGameState.teamTurn
        || gameState.imageId !== currentGameState.imageId;

    currentGameState = gameState;

    await drawRevealedPanelsAsync(gameState);

    drawImageEntityAsync(gameState);

    drawGameState(gameState);

    drawTeamStatus(gameState, firstLoad || isNewTurn);

    drawCaptains();

    drawIncorrectGuesses(gameState);

    drawAllPlayerDots(gameState, isNewTurn);

    drawMostVotesPanels(isNewTurn);
}

function drawImageEntityAsync(gameState) {
    getImageEntityAsync(gameState.imageId).then(imageEntity => {
        if (imageEntity && imageEntity.uploadedBy !== "admin") {
            document.getElementById("uploadedBy").innerHTML = "Uploaded by: " + imageEntity.uploadedBy;
            document.getElementById("uploadedBy").classList.remove("hidden");
        } else {
            document.getElementById("uploadedBy").classList.add("hidden");
        }

        if (imageEntity && imageEntity.name) {
            document.getElementById("answerTitle").innerHTML = imageEntity.name;
            document.getElementById("answerTitle").classList.add("opacity1Fade");
        } else {
            document.getElementById("answerTitle").classList.remove("opacity1Fade");
        }
    });
}

function handlePlayers(players) {
    allPlayers = players;

    var playerNameElements = document.getElementsByClassName("teamPlayerName");
    for (let playerNameElement of playerNameElements) {
        var found = false;
        players.forEach((player) => {
            if ("player_" + player.playerId === playerNameElement.id) {
                found = true;
            }
        });

        if (!found) {
            playerNameElement.remove();
        }
    }

    players.forEach((player) => {
        updatePlayer(player);
    });
}

function handleAddPlayer(player) {
    playerSelectedPanels[player.playerId] = player;

    updatePlayer(player);
    drawPlayerDots(player);
    drawMostVotesPanels();
}

function handleSelectPanels(player) {
    playerSelectedPanels[player.playerId] = player;

    drawPlayerDots(player);
    drawMostVotesPanels();
}

function drawSystemChat(chatsElementId, message) {
    document.getElementById("teamOneStatus").innerHTML = message;
}

function registerConnections() {
    connection.on("Players", handlePlayers);
    connection.on("AddPlayer", handleAddPlayer);
    connection.on("SelectPanels", handleSelectPanels);
    connection.on("GameState", handleGameState);

    connection.onreconnected = function () {
        if (localStorage.getItem("debug")) {
            drawSystemChat("chats", "SignalR reconnected");
        }
    }

    connection.onclose(async function () {
        if (localStorage.getItem("debug")) {
            drawSystemChat("chats", "SignalR closed.");
        }
        await startSignalRAsync("gameboard");
    });
}

var mouseTimer = null, cursorVisible = true;
function disappearCursor() {
    mouseTimer = null;
    document.body.style.cursor = "none";
    cursorVisible = false;
}

var reloadTimeout;
window.onresize = function () {
    clearTimeout(reloadTimeout);
    reloadTimeout = setTimeout(function () {
        location.reload();
    }, 250);
}

window.onload = async function () {
    createPanels();
    setupCanvases();

    document.onmousemove = function () {
        clearTimeout(mouseTimer);
        if (!cursorVisible) {
            document.body.style.cursor = "default";
            cursorVisible = true;
        }
        mouseTimer = window.setTimeout(disappearCursor, 3000);
    };


    startSignalRAsync("gameboard").then(function () {
        connection.invoke("RegisterGameBoard")
    });

    var promises = [];
    promises.push(getGameStateAsync());
    promises.push(getPlayersAsync());

    Promise.all(promises).then((results) => {
        currentGameState = results[0];
        handleGameState(currentGameState, true);

        handlePlayers(results[1]);
    });
}
