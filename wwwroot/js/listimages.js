var maxRatio = 1.9;

function listImages(username) {
    var url = "api/images/notApproved";

    if (username) {
        url = "api/images/username/" + username;
    }

    fetch(url, {
            headers: {
                "Authorization": localStorage.getItem("userToken")
            }
        })
        .then(response => response.json())
        .then(responseJson => {
            var imageContainerElement = document.getElementById("imageContainer");
            imageContainerElement.innerHTML = "";

            for (var image of responseJson.images) {
                var imageInfo = document.createElement("div");

                imageInfo.imageEntity = image;
                imageInfo.id = image.id;
                imageInfo.classList = "imageInfo imageInfoHidden";
                var nameInfoElement = document.createElement("div");
                imageInfo.appendChild(nameInfoElement);

                var img = document.createElement("img");
                img.src = "api/images/thumbnails/" + image.id + "?" + responseJson.queryString;
                img.classList = "privateInfo";
                let imageId = image.id;
                img.onclick = (event) => {
                    document.getElementById(imageId).classList.toggle("imageInfoHidden");
                }

                imageInfo.appendChild(img);

                imageContainerElement.appendChild(imageInfo);

                drawImageInfo(img, image, nameInfoElement, username);
            };
        });
}

function drawImageInfo(img, imageEntity, nameInfoElement, username) {
    if (!img.complete) {
        setTimeout(function () {
            drawImageInfo(img, imageEntity, nameInfoElement, username);
        }, 100);
        return;
    }
    var imgRect = getImgSizeInfo(img);

    var ratio = (imgRect.width / imgRect.height).toFixed(2);

    if (ratio >= maxRatio) {
        nameInfoElement.style.border = "5px solid red";

        var dimensions = document.createElement("div");
        dimensions.appendChild(document.createTextNode(imgRect.width.toFixed(2) + "x" + imgRect.height.toFixed(2) + " " + ratio));
        nameInfoElement.appendChild(dimensions);
    }

    var imageName = document.createElement("div");
    imageName.id = imageEntity.id + "_name";
    imageName.classList = "privateInfo";
    imageName.appendChild(document.createTextNode(imageEntity.name));
    nameInfoElement.appendChild(imageName);

    var imageAlternativeNames = document.createElement("div");
    imageAlternativeNames.id = imageEntity.id + "_alternativeNames";
    imageAlternativeNames.classList = "privateInfo";
    imageAlternativeNames.appendChild(document.createTextNode(imageEntity.alternativeNames));
    nameInfoElement.appendChild(imageAlternativeNames);

    var imageTags = document.createElement("div");
    imageTags.id = imageEntity.id + "_tags";
    imageTags.appendChild(document.createTextNode(imageEntity.tags));
    nameInfoElement.appendChild(imageTags);

    var imageUploadedBy = document.createElement("div");
    imageUploadedBy.id = imageEntity.id + "_uploadedBy";
    if (username) {
        imageUploadedBy.appendChild(document.createTextNode(username));
    } else {
        imageUploadedBy.appendChild(document.createTextNode(imageEntity.uploadedBy));
    }
    nameInfoElement.appendChild(imageUploadedBy);

    var actionLinks = document.createElement("div");

    var editLink = document.createElement("span");
    editLink.classList = "actionLink";
    editLink.onclick = function (event) {
        editImageAsync(imageEntity.id);
    };
    editLink.appendChild(document.createTextNode("Edit"));
    actionLinks.appendChild(editLink);

    var aproveLink = document.createElement("span");
    aproveLink.classList = "actionLink";
    aproveLink.onclick = function (event) {
        approveImageAsync(imageEntity.id);
    };
    aproveLink.appendChild(document.createTextNode("Approve"));
    actionLinks.appendChild(aproveLink);

    var deleteLink = document.createElement("span");
    deleteLink.classList = "actionLink";
    deleteLink.onclick = function (event) {
        deleteImageAsync(imageEntity.id);
    };
    deleteLink.appendChild(document.createTextNode("Delete"));
    actionLinks.appendChild(deleteLink);

    nameInfoElement.appendChild(actionLinks);
}

function showAllImages() {
    var imageInfos = document.getElementsByClassName("imageInfo");

    for (var imageInfo of imageInfos) {
        imageInfo.classList.remove("imageInfoHidden");
    }
}

async function editImageAsync(imageId) {
    var imageEntity = document.getElementById(imageId).imageEntity;

    var alternativeNames = imageEntity.alternativeNames.split(',');

    document.getElementById("editImageMenu").classList.remove("hidden");
    document.getElementById("imageId").value = imageId;
    document.getElementById("imageName").value = imageEntity.name;
    document.getElementById("imageAlternativeName1").value = alternativeNames[0] ? alternativeNames[0] : "";
    document.getElementById("imageAlternativeName2").value = alternativeNames[1] ? alternativeNames[1] : "";
    document.getElementById("imageAlternativeName3").value = alternativeNames[2] ? alternativeNames[2] : "";
    document.getElementById("tagsInput").value = imageEntity.tags;
}

async function patchImageAsync() {
    return await fetch("api/images/" + document.getElementById("imageId").value,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("userToken")
            },
            body: JSON.stringify({
                name: document.getElementById("imageName").value,
                alternativeNames: document.getElementById("imageAlternativeName1").value + "," + document.getElementById("imageAlternativeName2").value + "," + document.getElementById("imageAlternativeName3").value,
                tags: document.getElementById("tagsInput").value
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("The image failed to be updated.")
            }
            return response.json();
        })
        .then(responseJson => {
            document.getElementById(document.getElementById("imageId").value).imageEntity = responseJson;

            document.getElementById("editImageMenu").classList.add("hidden");

            document.getElementById(responseJson.id + "_name").innerHTML = responseJson.name;
            document.getElementById(responseJson.id + "_tags").innerHTML = responseJson.tags;
            document.getElementById(responseJson.id + "_alternativeNames").innerHTML = responseJson.alternativeNames;

            return responseJson;
        });
}

async function approveImageAsync(imageId) {
    var result = confirm("Approve image?");
    if (!result) {
        return;
    }

    return await fetch("api/images/" + imageId + "/approve",
        {
            method: "PUT",
            headers: {
                "Authorization": localStorage.getItem("userToken")
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("got bad response on delete image: " + response.text());
            }
            document.getElementById(imageId).remove();
        }).catch(error => {
            alert(error);
        });
}

async function deleteImageAsync(imageId) {
    var result = confirm("Delete image?");
    if (!result) {
        return;
    }

    return await fetch("api/images/" + imageId,
        {
            method: "DELETE",
            headers: {
                "Authorization": localStorage.getItem("userToken")
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("got bad response on delete image: " + response.text());
            }
            document.getElementById(imageId).remove();
        }).catch(error => {
            alert(error);
        });
}

window.onload = async function () {
    listImages();

    document.getElementById("saveButton").onclick = () => {
        patchImageAsync();
    };

    document.getElementById("cancelSaveButton").onclick = () => {
        document.getElementById("editImageMenu").classList.add("hidden");
    };

    document.getElementById("showAll").onclick = () => {
        showAllImages();
    };

    document.getElementById("loadUserImages").onclick = () => {
        listImages(document.getElementById("username").value);
    };
};