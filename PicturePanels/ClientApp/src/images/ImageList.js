import React, { useEffect, useState } from 'react';

//import { ImageInfo } from "./ImageInfo.js";

function ImageList(props) {
    const [images, setImages] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch(props.url + "images/uploadedby", {
            headers: {
                "Authorization": localStorage.getItem("userToken")
            }
        })
            .then(res => res.json())
            .then(
                (result) => {
                    setIsLoaded(true);
                    setImages(result.imageIds);
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    setIsLoaded(true);
                    setError(error);
                }
            )
    }, [])

    return (
        <div className="imageContainer">
            {images.map(image => (
                //<ImageInfo image={image} />
                <div>test</div>
            ))}
        </div>
    );
}

export default ImageList;
