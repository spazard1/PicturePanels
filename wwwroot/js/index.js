var across = 5;
var down = 4;

async function isAuthorized() {
    return await fetch("/api/authorize",
        {
            method: "GET",
            headers: {
                "Authorization": localStorage.getItem("Authorization")
            }
        })
        .then(response => {
            return response.ok;
        });
}

async function getGameStateAsync() {
    return await fetch("/api/gameState")
        .then(response => response.json())
        .then(responseJson => {
            return responseJson;
        });
}

async function getPlayer() {
    return await fetch("api/players/" + localStorage.getItem("playerId"))
        .then(response => response.json())
        .then(responseJson => {
            return responseJson;
        });
}

async function getPlayersAsync() {
    return await fetch("/api/players")
        .then(response => response.json())
        .then(responseJson => {
            return responseJson;
        });
}

async function getImageEntityAsync(imageId) {
    return fetch("/api/images/entity/" + imageId)
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
    return new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imgSrc;
    })
}

function loadThemeCss(gameState) {
    if (!gameState.themeCss) {
        return;
    }

    if (document.getElementById("themeCssLink").href.indexOf(gameState.themeCss) > 0) {
        return;
    }

    document.getElementById("themeCssLink").href = "themes/" + gameState.themeCss + ".css";
}

async function getBlobContainers() {
    return await fetch("/api/images/blobContainers", {
        method: "GET",
        headers: {
            "Authorization": localStorage.getItem("Authorization")
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

    for (let panelButton of panelButtons) {
        var panelButtonImage = panelButton.lastChild;

        if (gameState.revealedPanels.includes(panelButton.value)) {
            panelButton.classList.add("panelButtonDisabled");
            panelButton.classList.remove("panelButtonSelected");
            panelButtonImage.src = "/api/images/panels/" + gameState.imageId + "/" + panelButton.value;
        } else if (disabledPanels.includes(panelButton.value)) { 
            panelButton.classList.add("panelButtonDisabled");
            panelButton.classList.remove("panelButtonSelected");
            panelButtonImage.src = "/api/images/panels/" + gameState.imageId + "/0";
        } else {
            panelButton.classList.remove("panelButtonDisabled");
            panelButtonImage.src = "/api/images/panels/" + gameState.imageId + "/0";
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
    for (let panelButton of panelButtons) {
        panelButton.classList.remove("panelButtonSelected");
    }
}

async function sendSelectedPanels() {
    if (!localStorage.getItem("playerName")) {
        return;
    }

    var selectedPanels = [];
    var selectedPanelElements = document.getElementsByClassName("panelButtonSelected");
    for (let selectedPanel of selectedPanelElements) {
        if (selectedPanel.classList.contains("panelButtonDisabled")) {
            continue;
        }
        selectedPanels.push(selectedPanel.value);
    }

    await connection.invoke("SelectPanels", {
        PlayerId: localStorage.getItem("playerId"),
        Name: localStorage.getItem("playerName"),
        TeamNumber: parseInt(localStorage.getItem("teamNumber")),
        SelectedPanels: selectedPanels
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

function setupInputDefaultText(elementId, defaultValue, currentValue) {
    var inputElement = document.getElementById(elementId);

    inputElement.defaultValue = defaultValue;

    if (currentValue) {
        inputElement.value = currentValue;
    } else {
        inputElement.classList.add("inputDefaultText");
        inputElement.value = inputElement.defaultValue;
    }

    inputElement.onfocus = (event) => {
        if (event.target.value === event.target.defaultValue) {
            event.target.value = "";
            event.target.classList.remove("inputDefaultText");
        }
    }

    inputElement.onblur = (event) => {
        if (!event.target.value) {
            event.target.value = event.target.defaultValue;
            event.target.classList.add("inputDefaultText");
        }
    }

    inputElement.onchange = (event) => {
        if (!event || !event.target.value || event.target.value === event.target.defaultValue) {
            event.target.value = event.target.defaultValue;
            event.target.classList.add("inputDefaultText");
        }
    }
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
function createSignalRConnection(playerIdSuffix) {
    connection = new signalR.HubConnectionBuilder()
        .withUrl("/signalRHub?user=" + localStorage.getItem("playerId") + "_" + playerIdSuffix)
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

    registerConnections();
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
    if (!document.getElementById("signalRConnectionState")) {
        var connectionStateElement = document.createElement("div");
        connectionStateElement.classList = "hidden";
        connectionStateElement.id = "signalRConnectionState";
        document.body.appendChild(connectionStateElement);
    }

    if (connection && connection.state === "Connected") {
        if (localStorage.getItem("debug")) {
            drawSystemChat("chats", "SignalR already connected.");
        }
        return;
    }

    if (signalRTimeOut) {
        return;
    }

    createSignalRConnection(playerIdSuffix);
   
    await connection.start();

    setTimeout(function () {
        signalRTimeOut = true;
        playerIsReadyToPlay = false;
        drawSystemChat("chats", "You have been disconnected from the server. Refresh the page to connect again.")
        connection.stop();
    }, 1000 * 60 * 60 * 4);

    setInterval(signalRMonitor, 1000);

    if (localStorage.getItem("debug")) {
        drawSystemChat("chats", "SignalR started: " + playerIdSuffix);
    }
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