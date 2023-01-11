import ReactDOM from "react-dom/client";
import React, { useEffect, useRef, useState } from "react";
import * as electronActions from "./react/Actions/electionActions";
import { ipcRenderer } from "electron";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

function App() {
  const getImageFileBlob = async (fullPath) => {
    if (ipcRenderer) {
      const image = await ipcRenderer.invoke("evidence:getImageFileContent", fullPath);
      return new Blob([image]);
    }
    return "";
  };


  const [imageUrl, setImageUrl] = useState("");
  const [rotation, setRotation] = useState(0);

  const imageRef = useRef(null);

  const handleLeft = () => {
    let newRotation = rotation - 90;
    if (newRotation >= 360) {
      newRotation = -360;
    }
    setRotation(newRotation);
  };

  const handleRight = () => {
    let newRotation = rotation + 90;
    if (newRotation >= 360) {
      newRotation = -360;
    }
    setRotation(newRotation);
  };

  const zoomIn = () => {
    imageRef.current.width = imageRef.current.width * 1.2;
  };

  const zoomOut = () => {
    const width = imageRef.current.width / 1.2;
    if (width > 100) {
      imageRef.current.width = width;
    }
  };


  useEffect(() => {
    const handleOpenImage = async () => {
      const result = await electronActions.getOpenImage();
      const imageFileBlob = await getImageFileBlob(result);
      const url = URL.createObjectURL(imageFileBlob);
      setImageUrl(url);
    };
    handleOpenImage();
  }, []);

  return (

    <div className="container">
      <div className="row">
        <div className="col-12">
          <div className="my-3">
            <button type="button" className="btn c-btn" id="btnLeft" onClick={handleLeft}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                   className="bi bi-arrow-90deg-left" viewBox="0 0 16 16">
                <path fillRule="evenodd"
                      d="M1.146 4.854a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H12.5A2.5 2.5 0 0 1 15 6.5v8a.5.5 0 0 1-1 0v-8A1.5 1.5 0 0 0 12.5 5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4z" />
              </svg>
              <span className="ms-2">左旋</span>
            </button>
            <button type="button" className="btn c-btn" id="btnRight" onClick={handleRight}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                   className="bi bi-arrow-90deg-right" viewBox="0 0 16 16">
                <path fillRule="evenodd"
                      d="M14.854 4.854a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 4H3.5A2.5 2.5 0 0 0 1 6.5v8a.5.5 0 0 0 1 0v-8A1.5 1.5 0 0 1 3.5 5h9.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4z" />
              </svg>
              <span>右旋</span>
            </button>
            <button type="button" className="btn c-btn" id="zoomIn" onClick={zoomIn}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                   className="bi bi-zoom-in"
                   viewBox="0 0 16 16">
                <path fillRule="evenodd"
                      d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z" />
                <path
                  d="M10.344 11.742c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1 6.538 6.538 0 0 1-1.398 1.4z" />
                <path fillRule="evenodd"
                      d="M6.5 3a.5.5 0 0 1 .5.5V6h2.5a.5.5 0 0 1 0 1H7v2.5a.5.5 0 0 1-1 0V7H3.5a.5.5 0 0 1 0-1H6V3.5a.5.5 0 0 1 .5-.5z" />
              </svg>
              <span>放大</span>
            </button>
            <button type="button" className="btn c-btn" id="zoomOut" onClick={zoomOut}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                   className="bi bi-zoom-out"
                   viewBox="0 0 16 16">
                <path fill-rule="evenodd"
                      d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z" />
                <path
                  d="M10.344 11.742c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1 6.538 6.538 0 0 1-1.398 1.4z" />
                <path fill-rule="evenodd" d="M3 6.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z" />
              </svg>
              <span>縮小</span>
            </button>
          </div>
          <figure className="figure">
            <img id="image1"
                 style={{ transform: `rotate(${rotation}deg)` }}
                 className="img-fluid img-thumbnail"
                 src={imageUrl}
                 ref={imageRef} />
            <figcaption className="figure-caption"></figcaption>
          </figure>
        </div>
      </div>
    </div>
  );
}
