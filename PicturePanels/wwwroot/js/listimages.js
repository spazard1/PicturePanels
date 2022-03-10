var maxRatio = 1.9;

function listImages(search) {
    var url = "api/images/notApproved";

    if (search) {
        url = "api/images/search/" + search;
    }

    fetch(url, {
            headers: {
                "Authorization": localStorage.getItem("userToken")
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            return Promise.reject(response.status + " " + response.message);
        })
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

                if (image.isPlayed) {
                    imageInfo.classList.add("imageIsPlayed");
                }

                imageInfo.appendChild(img);

                imageContainerElement.appendChild(imageInfo);

                drawImageInfo(img, image, nameInfoElement);
            };

            document.getElementById("imageCount").innerHTML = responseJson.images.length;

        }).catch(error => {
            var imageContainerElement = document.getElementById("imageContainer");
            imageContainerElement.innerHTML = error;
        });
}

function drawImageInfo(img, imageEntity, nameInfoElement) {
    if (!img.complete) {
        setTimeout(function () {
            drawImageInfo(img, imageEntity, nameInfoElement);
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

    var isHidden = document.createElement("div");
    isHidden.id = imageEntity.id + "_isHidden";
    isHidden.classList = "isHidden";
    isHidden.appendChild(document.createTextNode("IsHidden: " + imageEntity.isHidden));
    nameInfoElement.appendChild(isHidden);

    var isPlayed = document.createElement("div");
    isPlayed.id = imageEntity.id + "_isPlayed";
    isPlayed.classList = "isPlayed";
    isPlayed.appendChild(document.createTextNode("isPlayed: " + imageEntity.isPlayed));
    nameInfoElement.appendChild(isPlayed);

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
    imageUploadedBy.appendChild(document.createTextNode(imageEntity.uploadedBy));
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

    var togglePlayedLink = document.createElement("span");
    togglePlayedLink.classList = "actionLink";
    togglePlayedLink.onclick = function (event) {
        togglePlayedAsync(imageEntity.id);
    };
    togglePlayedLink.appendChild(document.createTextNode("Played"));
    actionLinks.appendChild(togglePlayedLink);

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
    document.getElementById("isHiddenInput").checked = imageEntity.isHidden;

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
                tags: document.getElementById("tagsInput").value,
                isHidden: document.getElementById("isHiddenInput").checked
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
            document.getElementById(responseJson.id + "_isHidden").innerHTML = "IsHidden: " + responseJson.isHidden;
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
                throw new Error("got bad response on approve image: " + response.text());
            }
            document.getElementById(imageId).remove();
        }).catch(error => {
            alert(error);
        });
}

async function togglePlayedAsync(imageId) {
    var result = confirm("Toggle played?");
    if (!result) {
        return;
    }

    return await fetch("api/images/" + imageId + "/togglePlayed",
        {
            method: "PUT",
            headers: {
                "Authorization": localStorage.getItem("userToken")
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("got bad response on toggle played image: " + response.text());
            }
            document.getElementById(imageId).imageEntity.isPlayed = !document.getElementById(imageId).imageEntity.isPlayed;

            document.getElementById(imageId + "_isPlayed").innerHTML = "isPlayed: " + document.getElementById(imageId).imageEntity.isPlayed;
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

var toggleOnlyPlayed = false;

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
        listImages(document.getElementById("search").value);
    };

    document.getElementById("toggleIsPlayed").onclick = () => {
        toggleOnlyPlayed = !toggleOnlyPlayed;

        var playedImages = document.getElementsByClassName("imageIsPlayed");
        for (var image of playedImages) {
            image.classList.toggle("hidden");
        }

        var allImageCount = document.getElementsByClassName("imageInfo").length;

        if (toggleOnlyPlayed) {
            document.getElementById("imageCount").innerHTML = allImageCount - playedImages.length;
        } else {
            document.getElementById("imageCount").innerHTML = allImageCount;
        }

    };
};