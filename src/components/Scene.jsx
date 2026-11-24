import { useCallback, useEffect, useRef } from "react";
import { assets } from "../assets";
import { projects, stackSections } from "../data/portfolio";
import { TypingTest } from "./TypingTest";

const panelModeClass = {
  projects: "select-mode",
  stack: "stack-mode",
  typing: "typing-mode",
};

const selectedCharacterTargets = {
  projects: { desktop: 0.79, mobile: 0.79 },
  stack: { desktop: 0.75, mobile: 0.84 },
  typing: { desktop: 0.82, mobile: 0.84 },
};

function Character({ characterRef, slot, panel, image, label, isActive, onToggle }) {
  function handleKeyDown(event) {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    onToggle(panel);
  }

  return (
    <div
      ref={characterRef}
      className={`cast-slot ${slot}${isActive ? " active" : ""}`}
      role="button"
      tabIndex="0"
      aria-expanded={isActive}
      aria-label={label}
      onClick={() => onToggle(panel)}
      onKeyDown={handleKeyDown}
    >
      <img className="cast-member" src={image} alt="" draggable="false" />
    </div>
  );
}

function ProjectGrid({ onClose }) {
  return (
    <div className="projects-grid" aria-label="Projects" tabIndex="-1">
      {projects.map((project, index) => (
        <article className="project-card" style={{ "--i": index }} key={project.id}>
          <div className="project-top">
            <div className="project-logo">
              <img src={project.icon} alt="" />
            </div>
            <div>
              <h3 className="project-name">{project.name}</h3>
              <span className={`status-badge status-${project.status}`}>
                {project.status === "source" ? "source only" : project.status}
              </span>
            </div>
            <button className="card-close" type="button" aria-label="Close projects" onClick={onClose}>
              &times;
            </button>
          </div>
          <p className="project-sub">{project.description}</p>
          <div className="project-tags">
            {project.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <a className="demo-link" href={project.url} target="_blank" rel="noreferrer">
            {project.linkLabel} →
          </a>
        </article>
      ))}
    </div>
  );
}

function StackRow({ label, tools }) {
  const loopingTools = [...tools, ...tools];

  return (
    <section className="stack-row">
      <h3 className="stack-label">{label}</h3>
      <div className="marquee" aria-label={`${label} tools`}>
        <div className="marquee-track">
          {loopingTools.map((tool, index) => (
            <div className="tech-tile" key={`${tool.name}-${index}`} aria-hidden={index >= tools.length}>
              <img src={tool.icon} alt={index < tools.length ? tool.name : ""} loading="lazy" draggable="false" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StackGrid() {
  return (
    <div className="stack-grid" aria-label="Stack and tools" tabIndex="-1">
      <h2 className="stack-title">stack and tools</h2>
      <p className="stack-desc">
        The tools, frameworks, and platforms I reach for — across the front end, back end, and
        infrastructure.
      </p>
      {stackSections.map((section) => (
        <StackRow key={section.label} {...section} />
      ))}
    </div>
  );
}

export function Scene({
  activePanel,
  dismissTypingResultSignal,
  onClosePanel,
  onOpenAbout,
  onTogglePanel,
  onTypingResultVisibilityChange,
}) {
  const sceneRef = useRef(null);
  const sceneBackgroundRef = useRef(null);
  const castRef = useRef(null);
  const characterRefs = useRef({});

  const modeClass = activePanel ? panelModeClass[activePanel] : "";

  const setCharacterRef = useCallback(
    (panel) => (node) => {
      characterRefs.current[panel] = node;
    },
    [],
  );

  useEffect(() => {
    if (!activePanel) return undefined;

    const selectedCharacter = characterRefs.current[activePanel];
    const targets = selectedCharacterTargets[activePanel];

    if (!selectedCharacter || !targets) return undefined;

    function positionSelectedCharacter() {
      const rectangle = selectedCharacter.getBoundingClientRect();
      const targetFraction = window.innerWidth <= 900 ? targets.mobile : targets.desktop;
      const targetX = Math.min(window.innerWidth * targetFraction, window.innerWidth - 64);
      const shift = targetX - (rectangle.left + rectangle.width / 2);

      selectedCharacter.style.setProperty("--shift", `${shift.toFixed(1)}px`);
    }

    positionSelectedCharacter();
    window.addEventListener("resize", positionSelectedCharacter);

    return () => window.removeEventListener("resize", positionSelectedCharacter);
  }, [activePanel]);

  useEffect(() => {
    const scene = sceneRef.current;
    const sceneBackground = sceneBackgroundRef.current;
    const cast = castRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;

    if (!scene || !sceneBackground || reducedMotion || !hasFinePointer) return undefined;

    let animationFrameId = null;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    const maximumShift = 10;

    function animate() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      sceneBackground.style.transform = `scale(1.04) translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;

      if (cast) {
        cast.style.transform = `translate3d(${(currentX * 1.4).toFixed(2)}px, ${(currentY * 1.4).toFixed(2)}px, 0)`;
      }

      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        animationFrameId = null;
      }
    }

    function requestAnimation() {
      if (animationFrameId === null) animationFrameId = requestAnimationFrame(animate);
    }

    function handlePointerMove(event) {
      const rectangle = scene.getBoundingClientRect();
      targetX = ((event.clientX - rectangle.left) / rectangle.width - 0.5) * 2 * maximumShift * -1;
      targetY = ((event.clientY - rectangle.top) / rectangle.height - 0.5) * 2 * maximumShift * -1;
      requestAnimation();
    }

    function handlePointerLeave() {
      targetX = 0;
      targetY = 0;
      requestAnimation();
    }

    scene.addEventListener("pointermove", handlePointerMove);
    scene.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      scene.removeEventListener("pointermove", handlePointerMove);
      scene.removeEventListener("pointerleave", handlePointerLeave);
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <main className={`scene${modeClass ? ` ${modeClass}` : ""}`} ref={sceneRef}>
      <div className="scene-bg" ref={sceneBackgroundRef} aria-hidden="true" />

      <div className="cast" ref={castRef}>
        <Character
          characterRef={setCharacterRef("projects")}
          slot="s1"
          panel="projects"
          image={assets.firstCharacter}
          label="Select character - view projects"
          isActive={activePanel === "projects"}
          onToggle={onTogglePanel}
        />
        <Character
          characterRef={setCharacterRef("stack")}
          slot="s2"
          panel="stack"
          image={assets.secondCharacter}
          label="Select character - view stack and tools"
          isActive={activePanel === "stack"}
          onToggle={onTogglePanel}
        />
        <Character
          characterRef={setCharacterRef("typing")}
          slot="s3"
          panel="typing"
          image={assets.thirdCharacter}
          label="Select character - typing test"
          isActive={activePanel === "typing"}
          onToggle={onTogglePanel}
        />
      </div>

      <div className="hero-row">
        <div
          className="hero-inner"
          role="button"
          tabIndex="0"
          aria-label="Open about me"
          title="Open about me"
          onClick={onOpenAbout}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onOpenAbout();
            }
          }}
        >
          <section className="intro-card">
            <h1>Roinuj Plaza</h1>
            <p>
              I&rsquo;m a 3rd-year student and aspiring full-stack developer. I build modern web and
              mobile applications, and I&rsquo;m currently exploring generative AI and how it can be
              used to create useful, real-world solutions.
            </p>
          </section>

          <div className="cat-tile" aria-hidden="true">
            <img src={assets.portrait} alt="" draggable="false" />
          </div>
        </div>
      </div>

      <button className="projects-veil" type="button" aria-label="Close projects" onClick={onClosePanel} />
      <ProjectGrid onClose={onClosePanel} />

      <button className="stack-veil" type="button" aria-label="Close stack and tools" onClick={onClosePanel} />
      <StackGrid />

      <button className="typing-veil" type="button" aria-label="Close typing test" onClick={onClosePanel} />
      <div className="typing-grid" aria-label="Typing test">
        <h2 className="typing-title">typing test</h2>
        <TypingTest
          isOpen={activePanel === "typing"}
          dismissResultSignal={dismissTypingResultSignal}
          onResultVisibilityChange={onTypingResultVisibilityChange}
        />
      </div>
    </main>
  );
}
