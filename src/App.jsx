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

const themes = [
  { name: "Classic", foreground: "#111111", background: "#ffffff" },
  { name: "Ocean", foreground: "#155EEF", background: "#F5F9FF" },
  { name: "Purple", foreground: "#7C3AED", background: "#FAF7FF" },
  { name: "Forest", foreground: "#16803C", background: "#F3FBF5" },
  { name: "Rose", foreground: "#E11D48", background: "#FFF5F7" },
];


function LinkIcon() {
  return (
    <svg className="tab-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M10 13a5 5 0 0 0 7.07.07l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 11a5 5 0 0 0-7.07-.07l-2 2A5 5 0 0 0 10 20l1.15-1.15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TextIcon() {
  return (
    <svg className="tab-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 4h14v16H5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M8 9h8M8 12h8M8 15h5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg className="tab-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3 8.5a16 16 0 0 1 18 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6.5 12a10.5 10.5 0 0 1 11 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10 15.5a5.5 5.5 0 0 1 4 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle
        cx="12"
        cy="19"
        r="1"
        fill="currentColor"
      />
    </svg>
  );
}

function ContactIcon() {
  return (
    <svg className="tab-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="12"
        cy="8"
        r="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M5 20a7 7 0 0 1 14 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
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

  const [foreground, setForeground] = useState("#111111");
  const [background, setBackground] = useState("#ffffff");

  const canvasRef = useRef(null);

  const getQRValue = () => {
    if (type === "link") return link;
    if (type === "text") return text;

    if (type === "wifi") {
      if (!wifi.ssid) return "";

      const password =
        wifi.security === "nopass"
          ? ""
          : escapeWifi(wifi.password);

      return `WIFI:T:${wifi.security};S:${escapeWifi(
        wifi.ssid
      )};P:${password};H:${wifi.hidden};;`;
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
    if (!qrValue || !canvasRef.current) return;

    const timeout = setTimeout(() => {
      QRCode.toCanvas(
        canvasRef.current,
        qrValue,
        {
          width: 270,
          margin: 2,
          errorCorrectionLevel: "M",
          color: {
            dark: foreground,
            light: background,
          },
        },
        (error) => {
          if (error) console.error(error);
        }
      );
    }, 150);

    return () => clearTimeout(timeout);
  }, [qrValue, foreground, background]);

  const applyTheme = (theme) => {
    setForeground(theme.foreground);
    setBackground(theme.background);
  };

  const downloadQR = () => {
    if (!qrValue || !canvasRef.current) return;

    const downloadLink = document.createElement("a");
    downloadLink.download = "spawnqr.png";
    downloadLink.href =
      canvasRef.current.toDataURL("image/png");

    downloadLink.click();
  };

  return (
    <main className="page">

      {/* HEADER */}

      <header className="site-header">
        <div className="brand">
          <img
            className="logo-mark"
            src="/Logo.svg"
            alt="SpawnQR"
          />

          <div>
            <h1>
              Spawn<span>QR</span>
            </h1>

            <p>MAKE A QR. MAKE IT YOURS.</p>
          </div>
        </div>

        <nav className="top-nav">
          <a href="#">About</a>
          <a href="#">FAQ</a>
          <a href="#">Privacy</a>
          <a href="#">Contact</a>

          <a className="github-button" href="#">
            <span>◉</span>
            View on GitHub
          </a>
        </nav>
      </header>

      {/* HERO */}

      <section className="hero-copy">
        <div className="hero-line" />

        <div className="hero-title">
          Create.
          <br />
          Customize.
          <br />
          <span>Share.</span>
        </div>

        <p>
          Generate QR codes for links,
          <br />
          text, Wi-Fi, contacts and more.
          <br />
          Fast, free and no signup.
        </p>
      </section>

      {/* GENERATOR */}

      <section className="generator">

        <div className="generator-main">

          {/* CONTROLS */}

          <div className="controls">

            <nav className="tabs">

              <button
                className={type === "link" ? "active" : ""}
                onClick={() => setType("link")}
              >
                <LinkIcon />
                Link
              </button>

              <button
                className={type === "text" ? "active" : ""}
                onClick={() => setType("text")}
              >
                <TextIcon />
                Text
              </button>

              <button
                className={type === "wifi" ? "active" : ""}
                onClick={() => setType("wifi")}
              >
                <WifiIcon />
                Wi-Fi
              </button>

              <button
                className={type === "contact" ? "active" : ""}
                onClick={() => setType("contact")}
              >
                <ContactIcon />
                Contact
              </button>

            </nav>

            <div className="input-section">

              <h2>
                {type === "link" && "Enter a URL"}
                {type === "text" && "Enter your text"}
                {type === "wifi" && "Wi-Fi details"}
                {type === "contact" && "Contact details"}
              </h2>

              <p>
                {type === "link" &&
                  "Paste your link below to generate a QR code."}

                {type === "text" &&
                  "Type anything below to generate a QR code."}

                {type === "wifi" &&
                  "Enter your network details below."}

                {type === "contact" &&
                  "Create a scannable contact card."}
              </p>

              {type === "link" && (
                <input
                  className="main-input"
                  type="url"
                  placeholder="https://example.com"
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
                      setWifi({
                        ...wifi,
                        ssid: e.target.value,
                      })
                    }
                  />

                  <input
                    className="main-input"
                    type="password"
                    placeholder="Wi-Fi password"
                    disabled={wifi.security === "nopass"}
                    value={wifi.password}
                    onChange={(e) =>
                      setWifi({
                        ...wifi,
                        password: e.target.value,
                      })
                    }
                  />

                  <select
                    className="main-input"
                    value={wifi.security}
                    onChange={(e) =>
                      setWifi({
                        ...wifi,
                        security: e.target.value,
                      })
                    }
                  >
                    <option value="WPA">
                      WPA / WPA2
                    </option>

                    <option value="WEP">
                      WEP
                    </option>

                    <option value="nopass">
                      No password
                    </option>
                  </select>

                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={wifi.hidden}
                      onChange={(e) =>
                        setWifi({
                          ...wifi,
                          hidden: e.target.checked,
                        })
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
                      setContact({
                        ...contact,
                        name: e.target.value,
                      })
                    }
                  />

                  <input
                    className="main-input"
                    type="tel"
                    placeholder="Phone number"
                    value={contact.phone}
                    onChange={(e) =>
                      setContact({
                        ...contact,
                        phone: e.target.value,
                      })
                    }
                  />

                  <input
                    className="main-input"
                    type="email"
                    placeholder="Email"
                    value={contact.email}
                    onChange={(e) =>
                      setContact({
                        ...contact,
                        email: e.target.value,
                      })
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

            </div>

            {/* CUSTOMIZATION */}

            <div className="customization">

              <div className="custom-header">
                <div>
                  <h2>Customize</h2>
                  <p>Make it look yours.</p>
                </div>

                <button
                  className="reset-button"
                  onClick={() => {
                    setForeground("#111111");
                    setBackground("#ffffff");
                  }}
                >
                  ↻ Reset
                </button>
              </div>

              <div className="themes">

                {themes.map((theme) => (
                  <button
                    key={theme.name}
                    className="theme"
                    onClick={() => applyTheme(theme)}
                  >
                    <span
                      className="theme-preview"
                      style={{
                        background: theme.background,
                      }}
                    >
                      <span
                        style={{
                          background: theme.foreground,
                        }}
                      />
                    </span>

                    <small>{theme.name}</small>
                  </button>
                ))}

              </div>

              <div className="color-controls">

                <label>
                  <span>QR Color</span>

                  <div className="color-input">
                    <input
                      type="color"
                      value={foreground}
                      onChange={(e) =>
                        setForeground(e.target.value)
                      }
                    />

                    <code>{foreground}</code>
                  </div>
                </label>

                <label>
                  <span>Background Color</span>

                  <div className="color-input">
                    <input
                      type="color"
                      value={background}
                      onChange={(e) =>
                        setBackground(e.target.value)
                      }
                    />

                    <code>{background}</code>
                  </div>
                </label>

              </div>

            </div>

          </div>

          {/* PREVIEW */}

          <aside className="preview">

            <div
              className="qr-preview"
              style={{
                backgroundColor: background,
              }}
            >
              {qrValue ? (
                <canvas ref={canvasRef} />
              ) : (
                <div className="empty-qr">
                  <img
                    className="empty-logo"
                    src="/Logo.svg"
                    alt=""
                  />
                  <span>Your QR appears here</span>
                </div>
              )}
            </div>

            <button
              className="download-button"
              onClick={downloadQR}
              disabled={!qrValue}
            >
              ↓ &nbsp; Download PNG
            </button>

            <div className="preview-meta">
              <span>High quality</span>
              <i>•</i>
              <span>No watermark</span>
              <i>•</i>
              <span>Free forever</span>
            </div>

          </aside>

        </div>

      </section>

      {/* AD */}

      <div className="ad-placeholder">
        <span>ADVERTISEMENT</span>
        <small>SUPPORT SPAWNQR · KEEP IT FREE</small>
      </div>

      {/* FOOTER */}

      <footer>

        <div className="footer-brand">
          <strong>
            Spawn<span>QR</span>
          </strong>

          <span>© 2026 SpawnQR. All rights reserved.</span>
        </div>

        <div className="footer-links">
          <a href="#">About</a>
          <a href="#">FAQ</a>
          <a href="#">Privacy</a>
          <a href="#">Contact</a>
        </div>

      </footer>

    </main>
  );
}

export default App;