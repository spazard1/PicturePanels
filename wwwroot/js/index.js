var across = 5;
var down = 4;

function showMessage(message, isError) {
    if (!message) {
        document.getElementById("messageResults").classList.add("hidden");
        return;
    }
    document.getElementById("messageResults").classList.remove("hidden");
    document.getElementById("messageResults").innerHTML = message;

    if (isError) {
        document.getElementById("messageResults").classList.add("errorMessage");
    } else {
        document.getElementById("messageResults").classList.remove("errorMessage");
    }
}

function loginPrompt(callback) {
    bootbox.dialog({
        message: $("#loginPrompt").html().replaceAll("-modal", ""),
        title: "Login to Picture Panels",
        buttons: [
            {
                label: "Cancel",
                className: "btn btn-default pull-left"
            },
            {
                label: "Login",
                className: "btn btn-primary pull-left",
                callback: () => {
                    tryLoginAsync(document.getElementById("username").value, document.getElementById("password").value).then(callback)
                }
            }
        ]
    });

    document.getElementById("username").value = localStorage.getItem("username");
}

async function tryLoginAsync(username, password) {
    if (username) {
        localStorage.setItem("username", username);
    }

    return await fetch("/api/users/login",
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                UserName: username,
                Password: password
            })
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            return false;
        })
        .then(responseJson => {
            if (responseJson && responseJson.userToken) {
                localStorage.setItem("userToken", responseJson.userToken);
                document.getElementById("loggedInUser").classList.remove("hidden");

                return responseJson.user;
            }
            return false;
        });
}

async function setupLoggedInUserAsync(loginCallback) {
    document.getElementById("loginButton").onclick = () => {
        document.getElementById("loginButton").disabled = "disabled";
        loginPrompt(loginCallback);
    };

    var loggedInUserElement = document.getElementById("loggedInUser");
    if (loggedInUserElement) {
        if (document.getElementById("editUserButton")) {
            document.getElementById("editUserButton").onclick = () => {
                window.location.href = "/edituser";
            };
        }

        document.getElementById("logoutButton").onclick = () => {
            localStorage.removeItem("userToken");
            window.location.reload();
        };
    }

    if (localStorage.getItem("userToken")) {
        var user = await getUserAsync();
        if (user) {
            loggedInUserElement.classList.remove("hidden");
            loginCallback(user, true);
            return;
        }
    }

    localStorage.removeItem("userToken");
    loggedInUserElement.classList.add("hidden");
    loginCallback(null, true);
}

async function getUserAsync() {
    return await fetch("/api/users",
        {
            method: "GET",
            headers: {
                "Authorization": localStorage.getItem("userToken")
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            return false;
        });
}

async function getThemeAsync(gameStateId) {
    return await fetch("/api/themes/" + gameStateId,
        {
            method: "GET"
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            return false;
        });
}

async function setupTagsAsync(defaultTags) {
    var tagsInputs = document.getElementsByClassName("tagsInput");

    for (var tagsInput of tagsInputs) {
        var safeTags = await fetch("api/images/tags")
            .then(response => {
                if (!response.ok) {
                    throw new Error("The image failed to be uploaded.")
                }
                return response.json();
            });

        if (defaultTags) {
            tagsInput.value = defaultTags;
        }

        // init Tagify script on the above inputs
        tagify = new Tagify(tagsInput, {
            originalInputValueFormat: valuesArr => valuesArr.map(item => item.value).join(','),
            whitelist: safeTags,
            maxTags: 6,
            userInput: false,
            dropdown: {
                maxItems: 30,           // <- mixumum allowed rendered suggestions
                classname: "tags-look", // <- custom classname for this dropdown, so it could be targeted
                enabled: 0,             // <- show suggestions on focus
                closeOnSelect: false,    // <- do not hide the suggestions dropdown once an item has been selected
                placeAbove: true
            }
        });
    }
}

async function getGameStateAsync(gameStateId) {
    if (!gameStateId && localStorage.getItem("gameStateId")) {
        gameStateId = localStorage.getItem("gameStateId");
    } else {
        return null;
    }

    return await fetch("/api/gameState/" + gameStateId)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            return false;
        });
}

async function getPlayerAsync() {
    if (!localStorage.getItem("gameStateId") || !localStorage.getItem("playerId")) {
        return null;
    }
    return await fetch("api/players/" + localStorage.getItem("gameStateId") + "/" + localStorage.getItem("playerId"))
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            return;
        });
}

async function getPlayersAsync() {
    return await fetch("/api/players/" + localStorage.getItem("gameStateId") + "/")
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            return;
        });
}

async function putPlayerAsync() {
    return await fetch("api/players/" + localStorage.getItem("gameStateId") + "/" + localStorage.getItem("playerId"),
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                GameStateId: localStorage.getItem("gameStateId"),
                PlayerId: localStorage.getItem("playerId"),
                Name: localStorage.getItem("playerName"),
                TeamNumber: parseInt(localStorage.getItem("teamNumber")),
                Color: localStorage.getItem("playerColor"),
                ConnectionId: connection.connectionId
            })
        })
        .then(response => response.json())
        .then(responseJson => {
            return responseJson;
        });
}

async function getImageEntityAsync(gameStateId) {
    return fetch("/api/images/entity/" + gameStateId)
        .then(response => response.json())
        .then(responseJson => {
            return responseJson;
        }).catch(error => {
            return null;
        });
}

function mobileCheck() {
    let check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

async function loadImageAsync(img, imgSrc) {
    if (img.src === imgSrc) {
        return Promise.resolve(img);
    }

    return new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = imgSrc;
    })
}

var playerJoinSounds = [];
var openPanelSounds = [];
var teamReadySounds = [];
var correctSounds = [];
var incorrectSounds = [];
var loadedTheme = "";

function playRandomSound(sounds) {
    if (!sounds || sounds.length <= 0) {
        return;
    }
    sounds[Math.floor(Math.random() * sounds.length)].play();
}

async function loadThemeAsync(gameState, includeSounds) {
    if (!gameState.theme || gameState.theme === loadedTheme) {
        return;
    }

    loadedTheme = gameState.theme;

    if (document.getElementById("themeCssLink").href.indexOf(gameState.themeCss) > 0) {
        return;
    }

    playerJoinSounds = [];
    openPanelSounds = [];
    teamReadySounds = [];
    correctSounds = [];
    incorrectSounds = [];

    var theme = await getThemeAsync(gameState.gameStateId);

    document.getElementById("themeCssLink").href = "themes/" + theme.name + "/" + theme.css;

    if (includeSounds) {
        if (theme.playerJoinSounds) {
            theme.playerJoinSounds.forEach(sound => {
                playerJoinSounds.push(new Howl({
                    src: ["themes/" + theme.name + "/" + sound]
                }));
            });
        }
        if (theme.openPanelSounds) {
            theme.openPanelSounds.forEach(sound => {
                openPanelSounds.push(new Howl({
                    src: ["themes/" + theme.name + "/" + sound]
                }));
            });
        }
        if (theme.teamReadySounds) {
            theme.teamReadySounds.forEach(sound => {
                teamReadySounds.push(new Howl({
                    src: ["themes/" + theme.name + "/" + sound]
                }));
            });
        }
        if (theme.correctSounds) {
            theme.correctSounds.forEach(sound => {
                correctSounds.push(new Howl({
                    src: ["themes/" + theme.name + "/" + sound]
                }));
            });
        }
        if (theme.incorrectSounds) {
            theme.incorrectSounds.forEach(sound => {
                incorrectSounds.push(new Howl({
                    src: ["themes/" + theme.name + "/" + sound]
                }));
            });
        }
    }
}

async function getBlobContainers() {
    return await fetch("/api/images/blobContainers", {
        method: "GET",
        headers: {
            "Authorization": localStorage.getItem("userToken")
        },
    })
        .then(response => response.json())
        .then(responseJson => {
            return responseJson;
        });
}

function drawBlobContainers(blobContainers, blobContainerSelectId) {
    var blobContainerSelect = document.getElementById(blobContainerSelectId);

    blobContainers.forEach(function (blobContainerEntity) {
        var optionElement = document.createElement("option");
        optionElement.value = blobContainerEntity.name;
        optionElement.appendChild(document.createTextNode(blobContainerEntity.name));
        blobContainerSelect.appendChild(optionElement)
    });
}

var currentGameState; 

function drawGameState(gameState) {
    Object.keys(gameState).forEach(function (dataKey) {
        var element = document.getElementById(dataKey);
        if (element) {
            if (element.nodeName === "DIV" || element.nodeName === "SPAN") {
                document.getElementById(dataKey).innerHTML = gameState[dataKey];
            } else {
                document.getElementById(dataKey).value = gameState[dataKey];
            }
        }
    });
}

function drawPanelButtons() {
    var panelNumber = 1;

    var panelButtonsElement = document.getElementById("panelButtons");
    for (var i = 0; i < down; i++) {
        for (var j = 0; j < across; j++) {
            var panelButtonElement = document.createElement("div");
            panelButtonElement.classList.add("panelButton");
            panelButtonElement.classList.add("noHighlights");
            panelButtonElement.classList.add("panelButtonDisabled");
            panelButtonElement.onclick = panelButtonOnClick;
            panelButtonElement.value = panelNumber + "";

            var panelBackgroundElement = document.createElement("div");
            panelBackgroundElement.classList.add("panelButtonBackground");
            panelButtonElement.appendChild(panelBackgroundElement);

            var panelNumberElement = document.createElement("div");
            panelNumberElement.classList.add("panelButtonNumber");
            panelNumberElement.appendChild(document.createTextNode(panelNumber));
            panelBackgroundElement.appendChild(panelNumberElement);

            var panelImageElement = document.createElement("img");
            panelImageElement.classList.add("panelButtonImage");

            panelButtonElement.appendChild(panelImageElement);
            panelButtonsElement.appendChild(panelButtonElement);

            panelNumber++;
        }
    }
}

function updatePanelButtons(gameState, disabledPanels) {
    var panelButtons = document.getElementsByClassName("panelButton");

    if (!disabledPanels) {
        disabledPanels = [];
    }

    for (var panelButton of panelButtons) {
        var panelButtonImage = panelButton.lastChild;

        if (gameState.revealedPanels.includes(panelButton.value)) {
            panelButton.classList.add("panelButtonDisabled");
            panelButton.classList.remove("panelButtonSelected");
            panelButtonImage.src = "/api/images/panels/" + gameState.gameStateId + "/" + gameState.roundNumber + "/" + panelButton.value;
        } else if (disabledPanels.includes(panelButton.value)) { 
            panelButton.classList.add("panelButtonDisabled");
            panelButton.classList.remove("panelButtonSelected");
            panelButtonImage.src = "/api/images/panels/" + gameState.gameStateId + "/" + gameState.roundNumber + "/0";
        } else {
            panelButton.classList.remove("panelButtonDisabled");
            panelButtonImage.src = "/api/images/panels/" + gameState.gameStateId + "/" + gameState.roundNumber + "/0";
        }
    }
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function clearPanelButtonSelection() {
    var panelButtons = document.getElementsByClassName("panelButton");
    for (var panelButton of panelButtons) {
        panelButton.classList.remove("panelButtonSelected");
    }
}

async function sendSelectedPanels() {
    if (!localStorage.getItem("playerName")) {
        return;
    }

    var selectedPanels = [];
    var selectedPanelElements = document.getElementsByClassName("panelButtonSelected");
    for (var selectedPanel of selectedPanelElements) {
        if (selectedPanel.classList.contains("panelButtonDisabled")) {
            continue;
        }
        selectedPanels.push(selectedPanel.value);
    }

    await connection.invoke("SelectPanels", {
        gameStateId: localStorage.getItem("gameStateId"),
        playerId: localStorage.getItem("playerId"),
        name: localStorage.getItem("playerName"),
        teamNumber: parseInt(localStorage.getItem("teamNumber")),
        selectedPanels: selectedPanels
    });
}

function pixelRatio() {
    let deviceWidth = window.screen.width;
    let deviceHeight = window.screen.height;
    let devicePixelAspectRation = window.devicePixelRatio;

    document.getElementById("width").innerHTML = deviceWidth;
    document.getElementById("height").innerHTML = deviceHeight;
    document.getElementById("ratio").innerHTML = devicePixelAspectRation;

    console.log('Width: ' + deviceWidth);
    console.log('Height: ' + deviceHeight);
    console.log('Pixel  Ratio: ' + devicePixelAspectRation);
}

function getRenderedSize(contains, cWidth, cHeight, width, height, pos) {
    var oRatio = width / height,
        cRatio = cWidth / cHeight;
    return function () {
        if (contains ? (oRatio > cRatio) : (oRatio < cRatio)) {
            this.width = cWidth;
            this.height = cWidth / oRatio;
        } else {
            this.width = cHeight * oRatio;
            this.height = cHeight;
        }
        this.left = (cWidth - this.width) * (pos / 100);
        this.right = this.width + this.left;
        return this;
    }.call({});
}

function getImgSizeInfo(img) {
    var pos = window.getComputedStyle(img).getPropertyValue('object-position').split(' ');
    return getRenderedSize(true,
        img.width,
        img.height,
        img.naturalWidth,
        img.naturalHeight,
        parseInt(pos[0]));
}

function setInputDefaultText(elementId, defaultValue) {
    var inputElement = document.getElementById(elementId);

    if (inputElement.defaultValue === inputElement.value) {
        inputElement.value = defaultValue;
    }

    inputElement.defaultValue = defaultValue;
}


function setupAdminMenu() {
    var menuDiv = document.getElementById("adminMenu");

    var adminLink = document.createElement("a");
    adminLink.appendChild(document.createTextNode("Admin"));
    adminLink.href = "admin";
    menuDiv.appendChild(adminLink);

    var uploadLink = document.createElement("a");
    uploadLink.appendChild(document.createTextNode("Upload"));
    uploadLink.href = "upload";
    menuDiv.appendChild(uploadLink);

    var listLink = document.createElement("a");
    listLink.appendChild(document.createTextNode("List"));
    listLink.href = "listimages";
    menuDiv.appendChild(listLink);

    var setupLink = document.createElement("a");
    setupLink.appendChild(document.createTextNode("Setup"));
    setupLink.href = "setup";
    menuDiv.appendChild(setupLink);
}

var connection;
async function createSignalRConnectionAsync(playerIdSuffix) {
    connection = new signalR.HubConnectionBuilder()
        .withUrl("/signalRHub?user=" + localStorage.getItem("playerId") + "_" + playerIdSuffix)
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

    registerConnections();

    await connection.start();
}

var pingInterval;
function setupPing(pingFunction) {
    clearInterval(pingInterval);
    pingInterval = setInterval(pingFunction, 30000);
}

var reconnectingCount = 0;
function signalRMonitor() {
    if (!connection) {
        reconnectingCount = 0;
        document.getElementById("signalRConnectionState").classList.add("hidden");
        return;
    }

    if (connection.state === "Connected") {
        document.getElementById("signalRConnectionState").classList.add("hidden");
        return;
    }

    document.getElementById("signalRConnectionState").classList.remove("hidden");

    if (connection.state === "Disconnecting" || connection.state === "Disconnected") {
        clearInterval(pingInterval);

        document.getElementById("signalRConnectionState").innerHTML = "Disconnected from server. <a href='javascript: window.location.reload(true);'>Reload Page</a>";
        return;
    }

    if (connection.state === "Connecting" || connection.state === "Reconnecting") {
        reconnectingCount++;

        if (reconnectingCount > 4) {
            document.getElementById("signalRConnectionState").innerHTML = "Reconnecting to server...<a href='javascript: window.location.reload(true);'>Reload Page</a>";
        } else {
            document.getElementById("signalRConnectionState").innerHTML = "Reconnecting to server...";
        }
        return;
    }
}

function reloadPage() {
    location.reload();
}

function animateCSS(element, animationsToAdd, animationsToRemove, startDelay = 0, removeClassesWhenDone = false, prefix = 'animate__') {
    var node;
    if (typeof element !== "string") {
        node = element;
    } else {
        node = document.querySelector(element);
    }
    node.classList.add(prefix + "animated");

    function handleAnimationEnd(event) {
        event.stopPropagation();
        node.classList.remove(...animationsToAdd);
    }

    return new Promise((resolve) => {
        setTimeout(() => {
            animationsToAdd = animationsToAdd.map(animation => prefix + animation);
            animationsToRemove = animationsToRemove.map(animation => prefix + animation);

            node.classList.add(...animationsToAdd);
            node.classList.remove(...animationsToRemove);

            if (removeClassesWhenDone) {
                node.addEventListener('animationend', handleAnimationEnd, { once: true });
            }

            resolve();
        }, startDelay);
    });
}

var signalRTimeOut = false;
async function startSignalRAsync(playerIdSuffix) {
    var connectionStateElement = document.getElementById("signalRConnectionState");
    if (!connectionStateElement) {
        connectionStateElement = document.createElement("div");
        connectionStateElement.classList = "hidden";
        connectionStateElement.id = "signalRConnectionState";
        document.body.appendChild(connectionStateElement);
    } else {
        return;
    }

    if (signalRTimeOut) {
        return;
    }

    await createSignalRConnectionAsync(playerIdSuffix);
   
    setTimeout(function () {
        signalRTimeOut = true;
        connection.stop();
    }, 1000 * 60 * 60 * 4);

    setInterval(signalRMonitor, 1000);
};

if (!localStorage.getItem("playerId")) {
    localStorage.setItem("playerId", uuidv4());
}

const urlParams = new URLSearchParams(window.location.search);
const debugParam = urlParams.get('debug');
if (debugParam === "true") {
    localStorage.setItem("debug", true);
} else if (debugParam === "false") {
    localStorage.removeItem("debug");
}

if (window.location.href.indexOf("azurewebsites") >= 0) {
    window.location.href = "https://picturepanels.net";
}
