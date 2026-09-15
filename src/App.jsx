import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import "./App.css";

function App() {
  const [type, setType] = useState("link");

  const [link, setLink] = useState("");
  const [text, setText] = useState("");

  const canvasRef = useRef(null);

  const currentValue = type === "link" ? link : text;

  useEffect(() => {
    if (!currentValue) return;

    QRCode.toCanvas(
      canvasRef.current,
      currentValue,
      {
        width: 280,
        margin: 2,
        errorCorrectionLevel: "M",
      },
      (error) => {
        if (error) console.error(error);
      }
    );
  }, [currentValue]);

  const downloadQR = () => {
    if (!currentValue) return;

    const link = document.createElement("a");
    link.download = "spawnqr.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <main className="app">
      <header>
        <h1>SpawnQR</h1>
        <p>Create a QR code instantly.</p>
      </header>

      <nav className="tabs">
        <button
          className={type === "link" ? "active" : ""}
          onClick={() => setType("link")}
        >
          Link
        </button>

        <button
          className={type === "text" ? "active" : ""}
          onClick={() => setType("text")}
        >
          Text
        </button>

        <button disabled>Wi-Fi</button>
        <button disabled>Contact</button>
      </nav>

      <input
        className="main-input"
        type="text"
        placeholder={
          type === "link"
            ? "Paste a link..."
            : "Type your text..."
        }
        value={currentValue}
        onChange={(e) =>
          type === "link"
            ? setLink(e.target.value)
            : setText(e.target.value)
        }
      />

      <div className="qr-box">
        {currentValue ? (
          <canvas ref={canvasRef} />
        ) : (
          <span>Your QR code will appear here</span>
        )}
      </div>

      <button
        className="download-button"
        onClick={downloadQR}
        disabled={!currentValue}
      >
        Download PNG
      </button>
    </main>
  );
}

export default App;