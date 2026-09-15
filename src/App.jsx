import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import './App.css'

function App() {
  const [text, setText] = useState("");
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!text) {
      return;
    }

    QRCode.toCanvas(
      canvasRef.current,
      text,
      {
        width: 280,
        margin: 2,
        errorCorrectionLevel: "M",
      },
      (error) => {
        if (error) console.error(error);
      }
    );
  }, [text]);

  const downloadQR = () => {
    if (!text) return;

    const canvas = canvasRef.current;
    const link = document.createElement("a");

    link.download = "spawnqr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <main className="app">
      <h1>SpawnQR</h1>
      <p>Create a QR code instantly.</p>

      <div className="qr-box">
        {text ? (
          <canvas ref={canvasRef} />
        ) : (
          <span>Your QR code will appear here</span>
        )}
      </div>

      <input
        type="text"
        placeholder="Paste a link or type something..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button onClick={downloadQR} disabled={!text}>
        Download PNG
      </button>
    </main>
  );
}

export default App;