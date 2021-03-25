const { BlockBlobClient } = require("@azure/storage-blob");

var mainUrl = "api/images";

var apiversion = "";

export function upload() {
    var name = document.getElementById("name").value;

    if (!name || name.length < 3) {
        showError("Enter at least three characters for the title.");
        return;
    }

    var file = document.getElementById('fileInput').files[0];
    if (!file) {
        showError("Choose a file.");
        return;
    }

    var descriptionElement = document.getElementById('description');
    if (descriptionElement) {
        var description = descriptionElement.value;
    }

    fetch(mainUrl + apiversion, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            Name: name,
            Description: description
        })
    })
    .then(response => response.json())
    .then(responseJson => {
        simpleSuccess(responseJson);
    });
}
window.upload = upload;

export function showError(error) {
    document.getElementById("error").style.display = "block";
    document.getElementById("error").innerHTML = error;
    setTimeout(function () {
        document.getElementById("error").style.display = "none";
    }, 3000);
}

export async function simpleSuccess(data) {
    var file = document.getElementById('fileInput').files[0];

    const blockBlobClient = new BlockBlobClient(data.uploadUrl);

    startProgress();
    await blockBlobClient.uploadBrowserData(file, {
        onProgress: (ev) => {
            var progress = (ev.loadedBytes / file.size) * 100;
            document.getElementById("progress").style.width = progress + "%";
        }
    });

    uploadComplete(data.id);
}

function startProgress() {
    document.getElementById("progress").style.width = "0%";
    document.getElementById("progressOutline").style.display = "inline";
}

function endProgress() {
    document.getElementById("progressOutline").style.display = "none";
    document.getElementById("progress").style.width = "0%";
}

export function uploadComplete(id) {
    endProgress();

    fetch(mainUrl + "/" + id + "/uploadComplete" + apiversion, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then(responseJson => {
        addImage(responseJson);
    });
}

export function refreshImages() {
    apiversion = "?api-version=" + document.getElementById('api-version').value;

    fetch(mainUrl + apiversion)
    .then(response => response.json())
    .then(responseJson => {
        refreshImagesResult(responseJson);
    });
}
window.refreshImages = refreshImages;

export function purge() {
    fetch(mainUrl + apiversion, {
        method: "Delete"
    }).then(() => {
        document.getElementById("images").innerHTML = "";
    });
}
window.purge = purge;

export function refreshImagesResult(data) {
    var imagesDiv = document.getElementById("images");
    imagesDiv.innerHTML = '';

    data.forEach(addImage);
}

var currentSize = 0;

export function setImageSize(inputElement) {
    currentSize = inputElement.value;

    var imagesDiv = document.getElementById("images");

    imagesDiv.childNodes.forEach(function (imageElement) {
        imageElement.setAttribute("class", "size" + currentSize);
    });
}
window.setImageSize = setImageSize;

export function addImage(image) {
    var imagesDiv = document.getElementById("images");

    var imageElement = document.createElement("img");
    imageElement.setAttribute("src", mainUrl + "/" + image.id + apiversion);
    imageElement.setAttribute("title", image.description ? image.description : image.name);
    imageElement.setAttribute("alt", image.description ? image.description : image.name);
    imageElement.setAttribute("class", "size" + currentSize);
    imagesDiv.appendChild(imageElement);
}

window.onload = refreshImages;