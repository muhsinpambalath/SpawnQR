import { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
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

const eyeStyles = [
  {
    name: "Square",
    value: "square",
    square: "square",
    dot: "square",
  },
  {
    name: "Rounded",
    value: "rounded",
    square: "extra-rounded",
    dot: "dot",
  },
  {
    name: "Dot",
    value: "dot",
    square: "dot",
    dot: "dot",
  },
];

function emojiToDataUrl(emoji) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;

  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, 128, 128);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font =
    '96px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

  ctx.fillText(emoji, 64, 64);

  return canvas.toDataURL("image/png");
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
  const [dotStyle, setDotStyle] = useState("square");
  const [eyeStyle, setEyeStyle] = useState("square");
  const [gradientEnabled, setGradientEnabled] = useState(false);
  const [gradientStart, setGradientStart] = useState("#111111");
  const [gradientEnd, setGradientEnd] = useState("#39e875");
  const [gradientType, setGradientType] = useState("linear");
  const [gradientRotation, setGradientRotation] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState("Classic");
  const [centerContent, setCenterContent] = useState("none");
  const [emoji, setEmoji] = useState("⭐");
  const [logoImage, setLogoImage] = useState(null);
  const [logoName, setLogoName] = useState("");

  const qrContainerRef = useRef(null);
  const qrCodeRef = useRef(null);
  const currentEyeStyle =
    eyeStyles.find((style) => style.value === eyeStyle) ||
    eyeStyles[0];

  const centerImage =
    centerContent === "emoji"
      ? emojiToDataUrl(emoji)
      : centerContent === "logo"
        ? logoImage
        : undefined;

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
    if (!qrContainerRef.current) return;

    if (!qrCodeRef.current) {
      qrCodeRef.current = new QRCodeStyling({
        width: 270,
        height: 270,
        type: "canvas",
        margin: 8,
        qrOptions: {
          errorCorrectionLevel: "M",
        },
        dotsOptions: gradientEnabled
          ? {
              type: dotStyle,
              gradient: {
                type: gradientType,
                colorStops: [
                  { offset: 0, color: gradientStart },
                  { offset: 1, color: gradientEnd },
                ],
                rotation: (gradientRotation * Math.PI) / 180,
              },
            }
          : {
              type: dotStyle,
              color: foreground,
            },
        cornersSquareOptions: gradientEnabled
          ? {
              type: currentEyeStyle.square,
              gradient: {
                type: gradientType,
                colorStops: [
                  { offset: 0, color: gradientStart },
                  { offset: 1, color: gradientEnd },
                ],
                rotation: (gradientRotation * Math.PI) / 180,
              },
            }
          : {
              type: currentEyeStyle.square,
              color: foreground,
            },
        cornersDotOptions: gradientEnabled
          ? {
              type: currentEyeStyle.dot,
              gradient: {
                type: gradientType,
                colorStops: [
                  { offset: 0, color: gradientStart },
                  { offset: 1, color: gradientEnd },
                ],
                rotation: (gradientRotation * Math.PI) / 180,
              },
            }
          : {
              type: currentEyeStyle.dot,
              color: foreground,
            },

        image: centerImage,

        imageOptions: {
          hideBackgroundDots: true,
          imageSize: 0.3,
          margin: 6,
        },

        backgroundOptions: {
          color: background,
        },
      });

      qrCodeRef.current.append(qrContainerRef.current);
    }

    if (!qrValue) {
      qrContainerRef.current.innerHTML = "";
      return;
    }

    if (!qrContainerRef.current.hasChildNodes()) {
      qrCodeRef.current.append(qrContainerRef.current);
    }

    qrCodeRef.current.update({
      data: qrValue,
      width: 270,
      height: 270,
      margin: 8,
      qrOptions: {
        errorCorrectionLevel: centerContent === "emoji" ? "H" : "M",
      },

      image: centerImage,
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.3,
        margin: 6,
      },

      dotsOptions: gradientEnabled
        ? {
            type: dotStyle,
            gradient: {
              type: gradientType,
              colorStops: [
                { offset: 0, color: gradientStart },
                { offset: 1, color: gradientEnd },
              ],
              rotation: (gradientRotation * Math.PI) / 180,
            },
          }
        : {
            type: dotStyle,
            color: foreground,
            gradient: undefined,
          },
      cornersSquareOptions: gradientEnabled
        ? {
            type: currentEyeStyle.square,
            gradient: {
              type: gradientType,
              colorStops: [
                { offset: 0, color: gradientStart },
                { offset: 1, color: gradientEnd },
              ],
              rotation: (gradientRotation * Math.PI) / 180,
            },
          }
        : {
            type: currentEyeStyle.square,
            color: foreground,
            gradient: undefined,
          },
      cornersDotOptions: gradientEnabled
        ? {
            type: currentEyeStyle.dot,
            gradient: {
              type: gradientType,
              colorStops: [
                { offset: 0, color: gradientStart },
                { offset: 1, color: gradientEnd },
              ],
              rotation: (gradientRotation * Math.PI) / 180,
            },
          }
        : {
            type: currentEyeStyle.dot,
            color: foreground,
            gradient: undefined,
          },
      backgroundOptions: {
        color: background,
      },
    });
  }, [
    qrValue,
    foreground,
    background,
    dotStyle,
    eyeStyle,
    gradientEnabled,
    gradientStart,
    gradientEnd,
    gradientType,
    gradientRotation,
    centerContent,
    emoji,
    centerImage,
  ]);

  const applyTheme = (theme) => {
    setForeground(theme.foreground);
    setBackground(theme.background);
    setSelectedTheme(theme.name);
  };

  const downloadQR = async (format) => {
    if (!qrValue || !qrCodeRef.current) return;

    await qrCodeRef.current.download({
      name: "spawnqr",
      extension: format,
    });
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
                    setDotStyle("square");
                    setEyeStyle("square");
                    setSelectedTheme("Classic");
                    setGradientEnabled(false);
                    setGradientStart("#111111");
                    setGradientEnd("#39e875");
                    setGradientType("linear");
                    setGradientRotation(0);
                    setCenterContent("none");
                    setEmoji("⭐");
                    setLogoImage(null);
                    setLogoName("");
                  }}
                >
                  ↻ Reset
                </button>
              </div>

              <div className="themes">

                {themes.map((theme) => (
                  <button
                    key={theme.name}
                    className={`theme ${
                      selectedTheme === theme.name ? "active" : ""
                    }`}
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
                      onChange={(e) => {
                        setForeground(e.target.value);
                        setSelectedTheme(null);
                      }}
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
                      onChange={(e) => {
                        setBackground(e.target.value);
                        setSelectedTheme(null);
                      }}
                    />

                    <code>{background}</code>
                  </div>
                </label>

              </div>

              <div className="style-controls">
                <div className="style-section">
                  <span className="style-label">Dot Style</span>

                  <div className="style-options">
                    {[
                      ["square", "Square"],
                      ["rounded", "Rounded"],
                      ["dots", "Dots"],
                      ["classy", "Classy"],
                      ["extra-rounded", "Extra"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        className={`style-option ${
                          dotStyle === value ? "active" : ""
                        }`}
                        onClick={() => setDotStyle(value)}
                      >
                        <span className={`style-sample ${value}`} />
                        <small>{label}</small>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="style-section eye-style-section">
                <span className="style-label">Eye Style</span>

                <div className="style-options">
                  {eyeStyles.map((style) => (
                    <button
                      key={style.value}
                      className={`style-option ${
                        eyeStyle === style.value ? "active" : ""
                      }`}
                      onClick={() => setEyeStyle(style.value)}
                    >
                      <span className={`eye-sample ${style.value}`}>
                        <span />
                      </span>

                      <small>{style.name}</small>
                    </button>
                  ))}
                </div>
              </div>

              <div className="advanced-customization">
                <div className="advanced-section">
                  <div className="gradient-header">
                    <span className="style-label">Gradient</span>

                    <button
                      className={`gradient-toggle ${
                        gradientEnabled ? "active" : ""
                      }`}
                      onClick={() => setGradientEnabled(!gradientEnabled)}
                    >
                      {gradientEnabled ? "On" : "Off"}
                    </button>
                  </div>

                  {gradientEnabled && (
                    <div className="gradient-controls">
                      <div className="gradient-color">
                        <label>Start</label>

                        <label className="color-picker">
                          <input
                            type="color"
                            value={gradientStart}
                            onChange={(e) => setGradientStart(e.target.value)}
                          />
                          <span>{gradientStart}</span>
                        </label>
                      </div>

                      <div className="gradient-color">
                        <label>End</label>

                        <label className="color-picker">
                          <input
                            type="color"
                            value={gradientEnd}
                            onChange={(e) => setGradientEnd(e.target.value)}
                          />
                          <span>{gradientEnd}</span>
                        </label>
                      </div>

                      <div className="gradient-option">
                        <label>Type</label>

                        <select
                          value={gradientType}
                          onChange={(e) => setGradientType(e.target.value)}
                        >
                          <option value="linear">Linear</option>
                          <option value="radial">Radial</option>
                        </select>
                      </div>

                      <div className="gradient-option">
                        <label>Direction</label>

                        <select
                          value={gradientRotation}
                          onChange={(e) =>
                            setGradientRotation(Number(e.target.value))
                          }
                        >
                          <option value="0">0°</option>
                          <option value="45">45°</option>
                          <option value="90">90°</option>
                          <option value="135">135°</option>
                          <option value="180">180°</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="advanced-section center-content-section">
                  <div className="gradient-header">
                    <span className="style-label">Center Content</span>
                  </div>

                  <div className="center-content-options">
                    <button
                      className={`center-option ${
                        centerContent === "none" ? "active" : ""
                      }`}
                      onClick={() => setCenterContent("none")}
                    >
                      None
                    </button>

                    <button
                      className={`center-option ${
                        centerContent === "emoji" ? "active" : ""
                      }`}
                      onClick={() => setCenterContent("emoji")}
                    >
                      Emoji
                    </button>

                    <button
                      className={`center-option ${
                        centerContent === "logo" ? "active" : ""
                      }`}
                      onClick={() => setCenterContent("logo")}
                    >
                      Image
                    </button>
                  </div>

                  {centerContent === "emoji" && (
                    <div className="emoji-control">
                      <label>Emoji</label>

                      <input
                        type="text"
                        value={emoji}
                        onChange={(e) => setEmoji(e.target.value)}
                        maxLength={2}
                        placeholder="⭐"
                      />
                    </div>
                  )}

                  {centerContent === "logo" && (
                    <div className="logo-upload">
                      <label>Image</label>

                      <label className="upload-box">
                        <span className="upload-icon">+</span>
                        <span>{logoName || "Upload an image"}</span>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];

                            if (!file) return;

                            const reader = new FileReader();

                            reader.onload = () => {
                              setLogoImage(reader.result);
                              setLogoName(file.name);
                            };

                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>

                      {logoImage && (
                        <button
                          className="remove-logo"
                          onClick={() => {
                            setLogoImage(null);
                            setLogoName("");
                          }}
                        >
                          Remove image
                        </button>
                      )}
                    </div>
                  )}

                </div>
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
              <div
                ref={qrContainerRef}
                className={`qr-render ${!qrValue ? "hidden" : ""}`}
              />

              {!qrValue && (
                <div className="empty-qr">
                  <img
                    className="empty-logo"
                    src="/Logo-dark.svg"
                    alt=""
                  />
                  <span>Your QR appears here</span>
                </div>
              )}
            </div>

            <div className="download-buttons">
              <button
                className="download-button"
                onClick={() => downloadQR("png")}
                disabled={!qrValue}
              >
                ↓ &nbsp; Download PNG
              </button>

              <button
                className="download-button download-svg"
                onClick={() => downloadQR("svg")}
                disabled={!qrValue}
              >
                ↓ &nbsp; Download SVG
              </button>
            </div>

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
          <a href="#">GitHub</a>
        </div>

      </footer>

    </main>
  );
}

export default App;