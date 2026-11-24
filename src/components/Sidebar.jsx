import { projects } from "../data/portfolio";
import { ArrowIcon, CommentIcon, MailIcon, SoundIcon } from "./Icons";

function NavLink({ children, onClick }) {
  return (
    <a
      href="#"
      onClick={(event) => {
        event.preventDefault();
        onClick();
      }}
    >
      {children}
    </a>
  );
}

export function Topbar({ isDrawerOpen, onToggleDrawer, onHome }) {
  return (
    <header className="topbar">
      <a
        className="topbar-logo"
        href="#"
        onClick={(event) => {
          event.preventDefault();
          onHome();
        }}
      >
        Roinuj
      </a>
      <button
        className={`burger${isDrawerOpen ? " active" : ""}`}
        type="button"
        aria-expanded={isDrawerOpen}
        aria-controls="sidebar"
        aria-label={isDrawerOpen ? "Close menu" : "Open menu"}
        onClick={onToggleDrawer}
      >
        <span />
        <span />
        <span />
      </button>
    </header>
  );
}

export function Sidebar({
  isDrawerOpen,
  isProjectsMenuOpen,
  viewerCount,
  isPlaying,
  isAudioUnavailable,
  onCloseDrawer,
  onHome,
  onOpenAbout,
  onToggleProjects,
  onToggleStack,
  onToggleTyping,
  onToggleMusic,
  onOpenComments,
  onOpenHire,
}) {
  return (
    <aside className={`sidebar${isDrawerOpen ? " open" : ""}`} id="sidebar">
      <button className="drawer-close" type="button" aria-label="Close menu" onClick={onCloseDrawer}>
        &times;
      </button>

      <a
        className="logo reveal"
        href="#"
        onClick={(event) => {
          event.preventDefault();
          onHome();
        }}
      >
        Roinuj
      </a>

      <nav className="nav reveal d1" aria-label="Main">
        <NavLink onClick={onOpenAbout}>about me</NavLink>

        <div className={`dropdown${isProjectsMenuOpen ? " open" : ""}`}>
          <button
            id="dropdownBtn"
            type="button"
            aria-expanded={isProjectsMenuOpen}
            aria-haspopup="true"
            onClick={onToggleProjects}
          >
            projects <span className="arrow-ind">▼</span>
          </button>
          <ul className={`dropdown-menu${isProjectsMenuOpen ? " show" : ""}`} role="menu">
            {projects.map((project) => (
              <li key={project.id}>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  role="menuitem"
                  onClick={onCloseDrawer}
                >
                  {project.name} — {project.linkLabel}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <NavLink onClick={onToggleStack}>stack and tools</NavLink>
        <NavLink onClick={onToggleTyping}>typing test</NavLink>
      </nav>

      <hr className="rule" />

      <div className="viewers reveal d2">
        <div className="viewer-stack" aria-hidden="true">
          <span className="viewer v1" />
          <span className="viewer v2" />
          <span className="viewer v3" />
          <span className="viewer-badge">{viewerCount}+</span>
        </div>
        <p className="viewer-note">
          <span id="viewerCount">{viewerCount}</span> people viewing now
        </p>
      </div>

      <button
        className={`widget-btn reveal d3${isPlaying ? " is-playing" : ""}`}
        type="button"
        aria-pressed={isPlaying}
        title={isAudioUnavailable ? "Audio unavailable" : isPlaying ? "Pause music" : "Play music"}
        disabled={isAudioUnavailable}
        onClick={onToggleMusic}
      >
        <SoundIcon />
        <span className="eq" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        music
      </button>

      <button className="widget-btn reveal d4" type="button" title="Open comments" onClick={onOpenComments}>
        <CommentIcon />
        comments
      </button>

      <hr className="rule" />

      <button className="hire-btn reveal d5" type="button" aria-label="Hire me" onClick={onOpenHire}>
        hire me
        <ArrowIcon />
      </button>

      <div className="contact-block reveal d6">
        <p className="contact-label">For work, collabs &amp; everything else, reach me at</p>
        <a className="contact-email" href="mailto:plazaroinuj5@gmail.com" aria-label="Email me">
          <MailIcon />
          plazaroinuj5@gmail.com
        </a>
      </div>
    </aside>
  );
}
