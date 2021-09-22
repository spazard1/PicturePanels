function onPasteUrl(event) {
    var pastedUrl = (event.clipboardData || window.clipboardData).getData('text');

    if (pastedUrl) {
        showLoadingMessage("Loading from URL...");
        uploadTemporaryUrlAsync(pastedUrl);
        return;
    }

    var items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (index in items) {
        var item = items[index];
        if (item.kind === 'file') {
            showLoadingMessage("Loading from pasted image...");

            uploadTemporaryBlobAsync(item.getAsFile());
        }
    }
}

function onFileSelection(event) {
    var input = document.getElementById("imageFile");

    if (input.files && input.files[0]) {
        showLoadingMessage("Loading from file...");

        uploadTemporaryBlobAsync(input.files[0]);
    }
}

async function uploadTemporaryUrlAsync(uploadUrl) {
    return await fetch("api/images/uploadTemporaryUrl",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("userToken")
            },
            body: JSON.stringify({
                url: uploadUrl
            })
        })
        .then(handleUploadTemporaryAsync);
}

async function uploadTemporaryBlobAsync(blob) {
    return await fetch("api/images/uploadTemporaryBlob",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("userToken")
            },
            body: blob
        })
        .then(handleUploadTemporaryAsync);
}

async function handleUploadTemporaryAsync(response) {
    Promise.resolve().then(async () => {
        if (!response.ok) {
            throw new Error(await response.text());
        }
        return response.json();
    })
    .then(async responseJson => {
        setupCropper(responseJson.url);
        return responseJson;
    }).catch(function (error) {
        showLoadingMessage();

        showMessage(error.message, true);

        return null;
    });
}

async function putImageAsync(imageEntity) {
    if (document.getElementById("imageName").value.length < 2) {
        showMessage("The image name must be at least two characters.", true);
        return;
    }
    showMessage();

    showLoadingMessage("Saving image details...");

    return await fetch("api/images/" + imageEntity.id,
        {
            method: "PUT",
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
                throw new Error("The image failed to be created.")
            }
            return response.json();
        })
        .then(responseJson => {
            showLoadingMessage();
            document.getElementById("imageInfoPanel").classList.add("hidden");

            setupActionButton();
            showMessage("All done! If you have more images to upload, click \"Start Over.\"");

            return responseJson;
        }).catch(function (error) {
            showLoadingMessage();

            showMessage(error.message, true);

            return null;
        });
}

async function getCanvasBlobAsync() {
    return new Promise((resolve) => {
        cropper.getCroppedCanvas().toBlob((blob) => {
            resolve(blob);
        });
    });
}

async function postImageAsync() {
    showLoadingMessage("Saving cropped image...");

    var blob = await getCanvasBlobAsync();

    return await fetch("api/images/",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("userToken")
            },
            body: blob
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("The image failed to be uploaded.")
            }
            return response.json();
        })
        .then(imageEntity => {
            showLoadingMessage();

            showMessage("Step 3 of 3.<br/>Enter the image details.")

            document.getElementById("imagePreviewContainer").innerHTML = "<img src='api/images/" + imageEntity.id + "' class='imagePreview' />";

            document.getElementById("imagePreviewContainer").classList.remove("hidden");
            document.getElementById("imageInfoPanel").classList.remove("hidden");

            document.getElementById("cropperInstructions").classList.add("hidden");
            document.getElementById("cropperContainer").classList.add("hidden");
            document.getElementById("croppedImageInfo").classList.add("hidden");

            setupActionButton("Save", () => { putImageAsync(imageEntity); });

            return imageEntity;
        }).catch(function (error) {
            showLoadingMessage();

            showMessage(error.message, true);

            return null;
        });
}

function showLoadingMessage(message) {
    if (!message) {
        document.getElementById("imageUrl").disabled = "";
        document.getElementById("imageName").disabled = "";
        document.getElementById("uploadActionButton").disabled = "";
        document.getElementById("uploadStartOverButton").disabled = "";
        document.getElementById("loading").classList.add("hidden");
        return;
    }

    document.getElementById("imageUrl").disabled = "disabled";
    document.getElementById("imageName").disabled = "disabled";
    document.getElementById("uploadActionButton").disabled = "disabled";
    document.getElementById("uploadStartOverButton").disabled = "disabled";
    document.getElementById("loading").classList.remove("hidden");
    document.getElementById("loadingMessage").innerHTML = message;
}

function showMessage(message, isError) {
    if (!message) {
        document.getElementById("uploadResults").classList.add("hidden");
        return;
    }
    document.getElementById("uploadResults").classList.remove("hidden");
    document.getElementById("uploadResults").innerHTML = message;

    if (isError) {
        document.getElementById("uploadResults").classList.add("uploadErrorMessage");
    } else {
        document.getElementById("uploadResults").classList.remove("uploadErrorMessage");
    }
}

function drawDetails(event) {
    var aspectRatio = (event.detail.width / event.detail.height).toFixed(2);

    var imageWidth = Math.ceil(event.detail.width);
    var imageHeight = Math.ceil(event.detail.height);

    document.getElementById("imageWidth").innerHTML = imageWidth;
    document.getElementById("imageHeight").innerHTML = imageHeight;

    if (event.detail.width < 1000) {
        document.getElementById("imageSizeError").innerHTML = "Image width must be at least 1000 pixels. The cropped image is " + (1000 - imageWidth) + " pixels too small.";
        document.getElementById("uploadActionButton").disabled = "disabled";
    } else if (aspectRatio > 1.85) {
        document.getElementById("imageSizeError").innerHTML = "Aspect Ratio must be less than 1.85. The cropped image is too wide.";
        document.getElementById("uploadActionButton").disabled = "disabled";
    } else if (aspectRatio < 1.3) {
        document.getElementById("imageSizeError").innerHTML = "Aspect Ratio must be greater than 1.3. The cropped image is too square.";
        document.getElementById("uploadActionButton").disabled = "disabled";
    } else {
        document.getElementById("imageSizeError").innerHTML = "";
        document.getElementById("uploadActionButton").disabled = "";
    }
}

var cropper;
function setupCropper(url) {
    showLoadingMessage("Preparing image for cropping...");

    var cropperContainer = document.getElementById("cropperContainer");
    cropperContainer.classList.remove("hidden");
    document.getElementById("croppedImageInfo").classList.remove("hidden");
    document.getElementById("imagePreviewContainer").classList.add("hidden");
    document.getElementById("helpMessageContainer").classList.add("hidden");

    if (cropper) {
        cropper.replace(url);
        return;
    }

    cropperContainer.innerHTML = "";
    var imageElement = document.createElement("img");
    imageElement.src = url;
    imageElement.id = "cropperImage";
    cropperContainer.appendChild(imageElement);

    const cropperImage = document.getElementById('cropperImage');
    cropper = new Cropper(cropperImage, {
        aspectRatio: 16 / 9,
        crop(event) {
            drawDetails(event);
        },
    });

    cropperImage.addEventListener('ready', function () {
        showLoadingMessage();
        showMessage("Step 2 of 3.<br/>Crop the image if needed.")
        document.getElementById("chooseImagePanel").classList.add("hidden");
        document.getElementById("cropperInstructions").classList.remove("hidden");
        document.getElementById("uploadButtonsContainer").classList.remove("hidden");
        setupActionButton("Next", postImageAsync);
    });
}

function setupActionButton(value, callback) {
    var uploadActionButton = document.getElementById("uploadActionButton");

    if (value) {
        uploadActionButton.classList.remove("hidden");
        uploadActionButton.value = value;
        uploadActionButton.onclick = callback;
    } else {
        uploadActionButton.classList.add("hidden");
    }
}

function uploadLoginCallback(result) {
    if (result) {
        showMessage();
        document.getElementById("loginPanel").classList.add("hidden");
        document.getElementById("chooseImagePanel").classList.remove("hidden");
    } else {
        showMessage("That login didn't work. Try again.", true);
    }
}

const defaultTags = urlParams.get('tags');

async function setupTagsAsync() {
    var input = document.getElementById("tagsInput");

    var safeTags = await fetch("api/images/tags")
        .then(response => {
            if (!response.ok) {
                throw new Error("The image failed to be uploaded.")
            }
            return response.json();
        });

    input.value = defaultTags;

    // init Tagify script on the above inputs
    tagify = new Tagify(input, {
        originalInputValueFormat: valuesArr => valuesArr.map(item => item.value).join(','),
        whitelist: safeTags,
        maxTags: 10,
        userInput: false,
        dropdown: {
            maxItems: 20,           // <- mixumum allowed rendered suggestions
            classname: "tags-look", // <- custom classname for this dropdown, so it could be targeted
            enabled: 0,             // <- show suggestions on focus
            closeOnSelect: false    // <- do not hide the suggestions dropdown once an item has been selected
        }
    })
}

window.onload = async () => {
    setupTagsAsync();

    Cropper.setDefaults({
        viewMode: 0,
        initialAspectRatio: 16 / 9,
        guides: false,
        dragMode: 'move',
        autoCropArea: 1,
        zoomable: false,
        movable: false,
        rotatable: false
    });

    var authorizeResult = false;
    if (localStorage.getItem("userToken")) {
        authorizeResult = await tryAuthorizeTokenAsync();
    }

    if (authorizeResult) {
        document.getElementById("chooseImagePanel").classList.remove("hidden");
        showMessage("Step 1 of 3.<br/>Choose an image to upload.")
    } else {
        localStorage.removeItem("userToken");
        document.getElementById("loginPanel").classList.remove("hidden");
        showMessage("You must be logged in to upload an image.");
    }
    document.getElementById("helpMessageContainer").classList.remove("hidden");

    document.getElementById("imageUrl").onpaste = onPasteUrl;
    document.getElementById("imageUrl").onfocus = function (event) {
        document.getElementById("imageUrl").value = "";
    };

    document.getElementById("imageFile").onchange = onFileSelection;

    document.getElementById("loginButton").onclick = () => {
        loginPrompt(uploadLoginCallback);
    };

    document.getElementById("uploadStartOverButton").onclick = () => {
        document.getElementById("chooseImagePanel").classList.remove("hidden");
        document.getElementById("imageInfoPanel").classList.add("hidden");
        document.getElementById("uploadButtonsContainer").classList.add("hidden");
        document.getElementById("croppedImageInfo").classList.add("hidden");
        document.getElementById("cropperContainer").classList.add("hidden");
        document.getElementById("imagePreviewContainer").classList.add("hidden");
        document.getElementById("helpMessageContainer").classList.remove("hidden");

        document.getElementById("imageFile").value = "";
        document.getElementById("imageName").value = "";
        document.getElementById("imageAlternativeName1").value = "";
        document.getElementById("imageAlternativeName2").value = "";
        document.getElementById("imageAlternativeName3").value = "";
        document.getElementById("tagsInput").value = defaultTags;
    }

    document.getElementById("16x9Button").onclick = () => {
        if (cropper) {
            cropper.setAspectRatio(16 / 9);
        }
    };

    document.getElementById("4x3Button").onclick = () => {
        if (cropper) {
            cropper.setAspectRatio(4 / 3);
        }
    };

    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })
}
