var maxMostVotesTiles = 3;

function createTiles() {
    var tileNumber = 1;

    var tilesElement = document.getElementById("tiles");
    for (var i = 0; i < down; i++) {
        for (var j = 0; j < across; j++) {
            var tileElement = document.createElement("div");
            tileElement.classList.add("tile");
            tileElement.id = "tile_" + tileNumber;
            tileElement.tileNumber = "" + tileNumber;
            tileElement.value = tileNumber + "";

            var tileBackgroundElement = document.createElement("div");
            tileBackgroundElement.classList.add("tileBackground");
            tileElement.appendChild(tileBackgroundElement);

            var tileNumberElement = document.createElement("div");
            tileNumberElement.id = "tileNumber_" + tileNumber;
            tileNumberElement.classList.add("tileNumber");
            tileNumberElement.appendChild(document.createTextNode(tileNumber));
            tileBackgroundElement.appendChild(tileNumberElement);

            var tileImageElement = document.createElement("img");
            tileImageElement.classList.add("tileImage");
            tileElement.appendChild(tileImageElement);

            tilesElement.appendChild(tileElement);
            tileNumber++;
        }
    }

    var mostVotesTilesElement = document.getElementById("mostVotesTiles");

    for (var i = 0; i < maxMostVotesTiles; i++) {
        var mostVotesTileElement = document.createElement("div");
        mostVotesTileElement.classList.add("mostVotesTile");
        mostVotesTileElement.classList.add("opacity0");

        var mostVotesTileImageElement = document.createElement("img");
        mostVotesTileImageElement.classList.add("tileImage");
        mostVotesTileElement.appendChild(mostVotesTileImageElement);

        mostVotesTilesElement.appendChild(mostVotesTileElement);
    }
}

async function resetTilesAsync(gameState) {
    var imagePromises = [];
    var tiles = document.getElementsByClassName("tile");

    for (let tile of tiles) {
        tile.classList.remove("tileOpen");
        imagePromises.push(loadImageAsync(tile.lastChild, "/api/images/tiles/" + gameState.imageId + "/0"));
    }

    var mostVotesTileElements = document.getElementsByClassName("mostVotesTile");
    for (let mostVotesTileElement of mostVotesTileElements) {
        mostVotesTileElement.classList.add("opacity0");
        imagePromises.push(loadImageAsync(mostVotesTileElement.lastChild, "/api/images/tiles/" + gameState.imageId + "/0"));
    }

    await Promise.all(imagePromises);

    resizeTileContainer();
}

function resizeTileContainer() {
    var tilesContainer = document.getElementById('tiles');
    tilesContainer.style.maxWidth = "";

    var tilesContainerRect = tilesContainer.getBoundingClientRect();
    var tilesContainerMaxWidth = 83;
    var paddingBottom = 5;

    while (tilesContainerRect.height + tilesContainerRect.y >= (window.innerHeight - paddingBottom)) {
        tilesContainerMaxWidth -= .5;
        if (tilesContainerMaxWidth < 10) {
            break;
        }

        tilesContainer.style.maxWidth = tilesContainerMaxWidth + "vw";
        tilesContainerRect = tilesContainer.getBoundingClientRect();
    }
}

var playerSelectedTiles = {};

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
    
    playerSelectedTiles[player.playerId] = player;

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
            // generate a random number on the first-half (.5) of the tile, but use the entire valid range of the tile (offset is only half of the offset, so multiply by 2).
            playerFuzzies[player.playerId].fuzzY = .5 * Math.random() * (1 - middleYOffset * 2);
            if (Math.random() < .5) {
                // half of the time, choose the other side of the tile instead (.5), + the offset to get to the end of the tile
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

function drawMostVotesTiles(resetTiles) {
    if (resetTiles) {
        resetMaxVotesTiles();
    }

    var mostVotesTileElements = document.getElementsByClassName("mostVotesTile");

    if (currentGameState.turnType !== "OpenTile" &&
        currentGameState.turnType !== "OpenFreeTile") {
        for (let mostVotesTileElement of mostVotesTileElements) {
            mostVotesTileElement.classList.add("opacity0");
        }
        return;
    }

    var tileVotes = {};
    for (var i = 1; i <= across * down; i++) {
        tileVotes[i + ""] = 0;
    }

    for (const playerId in playerSelectedTiles) {
        if (playerSelectedTiles[playerId].teamNumber !== currentGameState.teamTurn) {
            continue;
        }
        playerSelectedTiles[playerId].selectedTiles.forEach(tile => {
            tileVotes[tile]++;
        });
    }

    var mostVotes = 0;
    var mostVotesTiles = [];

    for (const tile in tileVotes) {
        var tileElement = document.getElementById("tile_" + tile);
        if (tileElement.classList.contains("tileOpen")) {
            continue;
        }

        if (tileVotes[tile] > mostVotes) {
            mostVotes = tileVotes[tile];
            mostVotesTiles = [tile];
        } else if (tileVotes[tile] === mostVotes) {
            mostVotesTiles.push(tile);
        }
    }

    var mostVotesTileElements = document.getElementsByClassName("mostVotesTile");
    if (mostVotes === 0 || mostVotesTiles.length > maxMostVotesTiles) {
        for (let mostVotesTileElement of mostVotesTileElements) {
            mostVotesTileElement.classList.add("opacity0");
        }
    } else {
        for (let i = 0; i < maxMostVotesTiles; i++) {
            if (mostVotesTiles.length > i) {
                var tileElement = document.getElementById("tile_" + mostVotesTiles[i]);
                var tileElementRect = tileElement.getBoundingClientRect();
                mostVotesTileElements[i].classList.remove("opacity0");
                mostVotesTileElements[i].style.transform = "translate(" + tileElementRect.x + "px," + tileElementRect.y + "px)";
                mostVotesTileElements[i].style.width = tileElementRect.width + "px";
                mostVotesTileElements[i].style.height = tileElementRect.height + "px";
            } else {
                mostVotesTileElements[i].classList.add("opacity0");
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
            case "OpenTile":
                teamOneStatus.innerHTML = "Open Tile &rarr;";
                if (resetTimer) {
                    startCountdown("teamOneCountdownCanvas", gameState.openTileTime);
                }
                break;
            case "OpenFreeTile":
                teamOneStatus.innerHTML = "Open Free Tile &rarr;";
                if (resetTimer) {
                    startCountdown("teamOneCountdownCanvas", gameState.openTileTime);
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
            case "OpenTile":
                teamTwoStatus.innerHTML = "&larr; Open Tile";
                if (resetTimer) {
                    startCountdown("teamTwoCountdownCanvas", gameState.openTileTime);
                }
                break;
            case "OpenFreeTile":
                teamTwoStatus.innerHTML = "&larr; Open Free Tile";
                if (resetTimer) {
                    startCountdown("teamTwoCountdownCanvas", gameState.openTileTime);
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

function hideMostVotesTiles() {
    setClassStyle(".mostVotesTile", (element) => {
        element.style.opacity = 0;
    });
}

function hidePlayerDots(tileNumber) {
    if (tileNumber) {
        var playerDotDivs = document.getElementsByClassName("playerDot_tileNumber_" + tileNumber);
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
    var tiles = document.getElementsByClassName("tile");

    for (var i = 1; i <= across * down; i++) {
        var playerDotDiv = document.getElementById("playerDot_" + player.playerId + "_" + i);
        if (playerDotDiv) {
            drawPlayerDot(tiles, playerDotDiv, currentGameState);
        }
    }
}

function drawAllPlayerDots(gameState, resetDots) {
    if (resetDots) {
        resetPlayerDots();
    }

    var playerDotDivs = document.getElementsByClassName("playerDot");
    var tiles = document.getElementsByClassName("tile");

    for (let playerDotDiv of playerDotDivs) {
        drawPlayerDot(tiles, playerDotDiv, gameState);
    }
}

function drawPlayerDot(tiles, playerDotDiv, gameState) {
    if (playerSelectedTiles[playerDotDiv.player.playerId] &&
        playerSelectedTiles[playerDotDiv.player.playerId].selectedTiles.includes(playerDotDiv.tileNumber + "") &&
        playerDotDiv.player.teamNumber === currentGameState.teamTurn &&
        !tiles[playerDotDiv.tileNumber - 1].classList.contains("tileOpen") &&
        (gameState.turnType === "OpenTile" ||  gameState.turnType === "OpenFreeTile")) {
        movePlayerDotToTile(playerDotDiv);
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

function createPlayerDot(player, tileNumber) {
    var playerElement = document.getElementById("player_" + player.playerId);
    playerElementRect = playerElement.getBoundingClientRect();

    var scale = 1.1;
    var circleSize = Math.ceil(playerElementRect.height * scale);

    var playerDotDiv = document.createElement("div");
    playerDotDiv.id = "playerDot_" + player.playerId + "_" + tileNumber;
    playerDotDiv.player = player;
    playerDotDiv.tileNumber = tileNumber;
    playerDotDiv.style.width = circleSize + "px";
    playerDotDiv.style.height = circleSize + "px";

    playerDotDiv.classList.add("playerDot_tileNumber_" + tileNumber);
    playerDotDiv.classList.add("playerDot");
    playerDotDiv.classList.add("opacity0");
    playerDotDiv.classList.add("playerDot_" + player.playerId);
    document.body.appendChild(playerDotDiv);

    var playerDotSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    var playerDotInitials = document.createElement("div");
    playerDotInitials.id = "playerDotInitials_" + player.playerId + "_" + tileNumber;

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
        playerDotDiv.player.selectedTiles = [];
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

function movePlayerDotToTile(playerDotDiv) {
    var playerDotDiv = document.getElementById("playerDot_" + playerDotDiv.player.playerId + "_" + playerDotDiv.tileNumber);

    var tileRect = document.getElementById("tile_" + playerDotDiv.tileNumber).getBoundingClientRect();
    var playerDotDivRect = playerDotDiv.getBoundingClientRect();

    var x = (tileRect.right - tileRect.left - playerDotDivRect.width) * Math.abs(playerFuzzies[playerDotDiv.player.playerId].fuzzX) + tileRect.left;
    var y = (tileRect.bottom - tileRect.top - playerDotDivRect.height) * Math.abs(playerFuzzies[playerDotDiv.player.playerId].fuzzY) + tileRect.top;
    
    playerDotDiv.style.transform = "translate(" + x + "px," + y + "px)";
    playerDotDiv.classList.remove("opacity0");
}

function resetMaxVotesTiles() {
    playerSelectedTiles = {};

    setClassStyle(".mostVotesTile", (element) => {
        element.style.removeProperty("opacity");
    });
}

function openAllTiles() {
    hidePlayerDots();
    hideMostVotesTiles();

    var tiles = document.getElementsByClassName("tile");
    var tileCount = 1;

    var tilesArray = [];
    for (let tile of tiles) {
        tilesArray.push(tile);
    }
    shuffle(tilesArray);
    tilesArray.forEach(function (tile) {
        if (!tile.classList.contains("tileOpen")) {
            setTimeout(function () {
                loadImageAsync(tile.lastChild, "/api/images/tiles/" + currentGameState.imageId + "/" + tile.tileNumber).then(() => {
                    tile.classList.add("tileOpen");
                });
            }, tileCount++ * 150);
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

async function drawRevealedTilesAsync(gameState) {
    var promises = [];

    if (gameState.turnType === "Correct" || gameState.turnType === "EndRound") {
        openAllTiles();
        return;
    }

    var tiles = document.getElementsByClassName("tile");
    for (let tile of tiles) {
        var tileImage = tile.lastChild;

        if (gameState.revealedTiles.includes(tile.tileNumber)) {
            promises.push(loadImageAsync(tileImage, "/api/images/tiles/" + gameState.imageId + "/" + tile.tileNumber).then(() => {
                tile.classList.add("tileOpen");
                hidePlayerDots(tile.tileNumber);
            }));
        } else {
            tile.classList.remove("tileOpen");
            tileImage.src = "/api/images/tiles/" + gameState.imageId + "/0";
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
    var tiles = document.getElementsByClassName("tile");

    for (let tile of tiles) {
        tile.classList.remove("tileOpen");
        promises.push(loadImageAsync(tile.lastChild, "/api/images/tiles/welcome/" + tile.tileNumber));
    }

    return Promise.all(promises);
}

var welcomeAnimationTimeout;
var previousRandomIndex = -1;
function drawWelcomeAnimation() {
    hidePlayerDots();
    hideMostVotesTiles();

    var tiles = document.getElementsByClassName("tile");

    var tilesArray = [];
    for (let tile of tiles) {
        tilesArray.push(tile);
    }

    do {
        var randomIndex = Math.floor(Math.random() * tilesArray.length);
    } while (randomIndex === previousRandomIndex)
    previousRandomIndex = randomIndex;

    var tile = tilesArray[randomIndex];

    if (tile.classList.contains("tileOpen")) {
        tile.classList.remove("tileOpen");
    } else {
        tile.classList.add("tileOpen");
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
        resizeTileContainer();

        return;
    }

    if (firstLoad || gameState.imageId !== currentGameState.imageId) {
        await resetTilesAsync(gameState);
    }

    stopWelcomeAnimation();

    var isNewTurn = gameState.turnType !== currentGameState.turnType ||
        gameState.teamTurn !== currentGameState.teamTurn
        || gameState.imageId !== currentGameState.imageId;

    currentGameState = gameState;

    await drawRevealedTilesAsync(gameState);

    drawImageEntityAsync(gameState);

    drawGameState(gameState);

    drawTeamStatus(gameState, firstLoad || isNewTurn);

    drawCaptains();

    drawIncorrectGuesses(gameState);

    drawAllPlayerDots(gameState, isNewTurn);

    drawMostVotesTiles(isNewTurn);
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
    playerSelectedTiles[player.playerId] = player;

    updatePlayer(player);
    drawPlayerDots(player);
    drawMostVotesTiles();
}

function handleSelectTiles(player) {
    playerSelectedTiles[player.playerId] = player;

    drawPlayerDots(player);
    drawMostVotesTiles();
}

function drawSystemChat(chatsElementId, message) {
    document.getElementById("teamOneStatus").innerHTML = message;
}

function registerConnections() {
    connection.on("Players", handlePlayers);
    connection.on("AddPlayer", handleAddPlayer);
    connection.on("SelectTiles", handleSelectTiles);
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
    createTiles();
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
