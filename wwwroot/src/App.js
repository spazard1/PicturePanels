import ImageList from './images/ImageList.js'

function App() {

    var url;
    if (process.env.NODE_ENV === 'development') {
        url = 'https://localhost:44359/api/'
    }

    if (process.env.NODE_ENV === 'production') {
        url = 'https://picturepanels.net/api/'
    }

    return (
        <ImageList url={url} />
    );
}

export default App;
