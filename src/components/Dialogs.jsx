import { useEffect, useRef, useState } from "react";
import { assets } from "../assets";
import { certificates, socialLinks } from "../data/portfolio";
import { SocialIcon } from "./Icons";
import { ModalBackdrop } from "./ModalBackdrop";

const COMMENTS_STORAGE_KEY = "roinuj.plaza.comments";
const MAX_COMMENTS = 50;

function readComments() {
  try {
    const storedComments = window.localStorage.getItem(COMMENTS_STORAGE_KEY);
    const parsedComments = storedComments ? JSON.parse(storedComments) : [];
    return Array.isArray(parsedComments) ? parsedComments : [];
  } catch {
    return [];
  }
}

function saveComments(comments) {
  try {
    window.localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
  } catch {
    // Storage can be unavailable in private browsing. The current page still works.
  }
}

function formatTimestamp(timestamp) {
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return "";
  }
}

export function CommentsDialog({ isOpen, onClose }) {
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    setComments(readComments());
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [isOpen]);

  function handleSubmit(event) {
    event.preventDefault();

    const message = comment.trim();
    if (!message) return;

    const updatedComments = [
      { text: message.slice(0, 140), createdAt: Date.now() },
      ...comments,
    ].slice(0, MAX_COMMENTS);

    setComments(updatedComments);
    saveComments(updatedComments);
    setComment("");
  }

  return (
    <ModalBackdrop
      isOpen={isOpen}
      className="dialog-backdrop"
      onClose={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="commentsTitle"
    >
      <div className="dialog">
        <header className="dialog-head">
          <span id="commentsTitle">comments.log</span>
          <button className="dialog-close" type="button" aria-label="Close comments" onClick={onClose}>
            &times;
          </button>
        </header>

        <ul className="comment-list">
          {comments.length === 0 ? (
            <li className="empty">no comments yet — be the first!</li>
          ) : (
            comments.map((item) => (
              <li key={item.createdAt}>
                {item.text}
                <span className="when">{formatTimestamp(item.createdAt)}</span>
              </li>
            ))
          )}
        </ul>

        <form className="comment-form" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={comment}
            maxLength="140"
            placeholder="leave a comment..."
            autoComplete="off"
            required
            onChange={(event) => setComment(event.target.value)}
          />
          <button type="submit">post</button>
        </form>
      </div>
    </ModalBackdrop>
  );
}

export function AboutDialog({ isOpen, onClose, onOpenCertificate }) {
  const [isChartUnavailable, setIsChartUnavailable] = useState(false);

  useEffect(() => {
    if (isOpen) setIsChartUnavailable(false);
  }, [isOpen]);

  return (
    <ModalBackdrop
      isOpen={isOpen}
      className="about-backdrop"
      onClose={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="aboutTitle"
    >
      <div className="about-panel">
        <div className="about-hero">
          <section className="about-content">
            <h2 className="about-title" id="aboutTitle">
              Roinuj Plaza
            </h2>
            <p className="about-bio">
              I&rsquo;m a 3rd-year student and aspiring full-stack developer. I build modern web and
              mobile applications, and I&rsquo;m currently exploring generative AI and how it can be
              used to create useful, real-world solutions.
            </p>
            <div className="social-row">
              {socialLinks.map((socialLink) => (
                <a
                  className="social-btn"
                  key={socialLink.name}
                  href={socialLink.url}
                  title={socialLink.name}
                  aria-label={socialLink.name}
                  target="_blank"
                  rel="noreferrer"
                >
                  <SocialIcon name={socialLink.icon} />
                </a>
              ))}
            </div>
          </section>

          <div className="about-tile" aria-hidden="true">
            <img src={assets.portrait} alt="" draggable="false" />
          </div>
        </div>

        <p className="about-label">certifications</p>
        <div className="cert-grid">
          {certificates.map((certificate) => (
            <button
              className="cert-card cert-card--img"
              key={certificate.id}
              type="button"
              aria-label={`View ${certificate.alt}`}
              onClick={() => onOpenCertificate(certificate)}
            >
              <img
                className="cert-img"
                src={certificate.image}
                alt={certificate.alt}
                loading="lazy"
                draggable="false"
              />
            </button>
          ))}
        </div>

        <p className="about-label">github</p>
        <div className="github-block">
          <div className="github-head">
            <span>contributions</span>
            <a className="gh-user" href="https://github.com/RoinujPlaza" target="_blank" rel="noreferrer">
              @RoinujPlaza
            </a>
          </div>
          {isChartUnavailable ? (
            <p className="github-fallback">contributions chart unavailable (offline?)</p>
          ) : (
            <img
              className="github-chart"
              src="https://ghchart.rshah.org/RoinujPlaza"
              alt="RoinujPlaza GitHub contribution graph"
              loading="lazy"
              draggable="false"
              onError={() => setIsChartUnavailable(true)}
            />
          )}
        </div>
      </div>
    </ModalBackdrop>
  );
}

export function CertificateLightbox({ certificate, onClose }) {
  const isOpen = Boolean(certificate);

  return (
    <div
      className={`cert-lightbox${isOpen ? "" : " hidden"}`}
      role="dialog"
      aria-modal="true"
      aria-label="Certificate preview"
      onClick={onClose}
    >
      {certificate && (
        <div className="cert-card cert-zoom">
          <img className="cert-img" src={certificate.image} alt={certificate.alt} draggable="false" />
        </div>
      )}
    </div>
  );
}

export function HireDialog({ isOpen, onClose }) {
  const [status, setStatus] = useState("");
  const [isSending, setIsSending] = useState(false);
  const formRef = useRef(null);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    setStatus("");
    requestAnimationFrame(() => nameInputRef.current?.focus());
  }, [isOpen]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!formRef.current) return;

    setIsSending(true);
    setStatus("sending...");

    try {
      const response = await fetch("https://formsubmit.co/ajax/plazaroinuj5@gmail.com", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(formRef.current),
      });

      if (!response.ok) throw new Error("Unable to send form");

      formRef.current.reset();
      setStatus("message sent!");
    } catch {
      setStatus("could not send. please try again.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <ModalBackdrop
      isOpen={isOpen}
      className="dialog-backdrop"
      onClose={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="hireTitle"
    >
      <div className="dialog hire-dialog">
        <header className="dialog-head">
          <span id="hireTitle">hire me</span>
          <button className="dialog-close" type="button" aria-label="Close hire form" onClick={onClose}>
            &times;
          </button>
        </header>

        <form className="hire-form" ref={formRef} onSubmit={handleSubmit}>
          <input type="hidden" name="_subject" value="New hire message from portfolio site" />
          <input type="hidden" name="_captcha" value="false" />
          <input type="hidden" name="_template" value="table" />

          <label className="hire-field">
            <span className="hire-label">your name</span>
            <input ref={nameInputRef} type="text" name="name" placeholder="Your name" required autoComplete="name" />
          </label>
          <label className="hire-field">
            <span className="hire-label">your email</span>
            <input type="email" name="email" placeholder="you@email.com" required autoComplete="email" />
          </label>
          <label className="hire-field">
            <span className="hire-label">message</span>
            <textarea name="message" rows="5" placeholder="Tell me about your project..." required />
          </label>

          <button type="submit" className="hire-send" disabled={isSending}>
            send message
          </button>
          <p className="hire-status" aria-live="polite">
            {status}
          </p>
        </form>
      </div>
    </ModalBackdrop>
  );
}
