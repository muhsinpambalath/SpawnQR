import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import "./App.css";

function escapeWifi(value) {
  return value.replace(/([\\;,:\"])/g, "\\$1");
}

function escapeVCard(value) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/\r?\n/g, "\\n");
}

function App() {
  const [type, setType] = useState("link");

  const [link, setLink] = useState("");
  const [text, setText] = useState("");

  const [wifi, setWifi] = useState({
    ssid: "",
    password: "",
    security: "WPA",
    hidden: false,
  });

  const [contact, setContact] = useState({
    name: "",
    phone: "",
    email: "",
    organization: "",
    website: "",
  });

  const canvasRef = useRef(null);

  const getQRValue = () => {
    if (type === "link") return link;
    if (type === "text") return text;

    if (type === "wifi") {
      if (!wifi.ssid) return "";

      const ssid = escapeWifi(wifi.ssid);
      const password =
        wifi.security === "nopass"
          ? ""
          : escapeWifi(wifi.password);

      return `WIFI:T:${wifi.security};S:${ssid};P:${password};H:${wifi.hidden};;`;
    }

    if (type === "contact") {
      if (!contact.name && !contact.phone && !contact.email) {
        return "";
      }

      return `BEGIN:VCARD
VERSION:3.0
FN:${escapeVCard(contact.name)}
TEL:${escapeVCard(contact.phone)}
EMAIL:${escapeVCard(contact.email)}
ORG:${escapeVCard(contact.organization)}
URL:${escapeVCard(contact.website)}
END:VCARD`;
    }

    return "";
  };

  const qrValue = getQRValue();

  useEffect(() => {
    if (!qrValue) return;

    const timeout = setTimeout(() => {
      const canvas = canvasRef.current;

      if (!canvas) return;

      QRCode.toCanvas(
        canvas,
        qrValue,
        {
          width: 280,
          margin: 2,
          errorCorrectionLevel: "M",
        },
        (error) => {
          if (error) console.error(error);
        }
      );
    }, 150);

    return () => clearTimeout(timeout);
  }, [qrValue]);

  const downloadQR = () => {
    if (!qrValue || !canvasRef.current) return;

    const downloadLink = document.createElement("a");

    downloadLink.download = "spawnqr.png";
    downloadLink.href = canvasRef.current.toDataURL("image/png");
    downloadLink.click();
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

        <button
          className={type === "wifi" ? "active" : ""}
          onClick={() => setType("wifi")}
        >
          Wi-Fi
        </button>

        <button
          className={type === "contact" ? "active" : ""}
          onClick={() => setType("contact")}
        >
          Contact
        </button>
      </nav>

      <section className="form-area">
        {type === "link" && (
          <input
            className="main-input"
            type="url"
            placeholder="Paste a link..."
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        )}

        {type === "text" && (
          <textarea
            className="main-input text-input"
            placeholder="Type your text..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        )}

        {type === "wifi" && (
          <div className="fields">
            <input
              className="main-input"
              placeholder="Network name (SSID)"
              value={wifi.ssid}
              onChange={(e) =>
                setWifi({ ...wifi, ssid: e.target.value })
              }
            />

            <input
              className="main-input"
              type="password"
              placeholder="Wi-Fi password"
              disabled={wifi.security === "nopass"}
              value={wifi.password}
              onChange={(e) =>
                setWifi({ ...wifi, password: e.target.value })
              }
            />

            <select
              className="main-input"
              value={wifi.security}
              onChange={(e) =>
                setWifi({ ...wifi, security: e.target.value })
              }
            >
              <option value="WPA">WPA / WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">No password</option>
            </select>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={wifi.hidden}
                onChange={(e) =>
                  setWifi({ ...wifi, hidden: e.target.checked })
                }
              />
              Hidden network
            </label>
          </div>
        )}

        {type === "contact" && (
          <div className="fields">
            <input
              className="main-input"
              placeholder="Full name"
              value={contact.name}
              onChange={(e) =>
                setContact({ ...contact, name: e.target.value })
              }
            />

            <input
              className="main-input"
              type="tel"
              placeholder="Phone number"
              value={contact.phone}
              onChange={(e) =>
                setContact({ ...contact, phone: e.target.value })
              }
            />

            <input
              className="main-input"
              type="email"
              placeholder="Email"
              value={contact.email}
              onChange={(e) =>
                setContact({ ...contact, email: e.target.value })
              }
            />

            <input
              className="main-input"
              placeholder="Organization (optional)"
              value={contact.organization}
              onChange={(e) =>
                setContact({
                  ...contact,
                  organization: e.target.value,
                })
              }
            />

            <input
              className="main-input"
              type="url"
              placeholder="Website (optional)"
              value={contact.website}
              onChange={(e) =>
                setContact({
                  ...contact,
                  website: e.target.value,
                })
              }
            />
          </div>
        )}
      </section>

      <div className="qr-box">
        {qrValue ? (
          <canvas ref={canvasRef} />
        ) : (
          <span>Your QR code will appear here</span>
        )}
      </div>

      <button
        className="download-button"
        onClick={downloadQR}
        disabled={!qrValue}
      >
        Download PNG
      </button>
    </main>
  );
}

export default App;