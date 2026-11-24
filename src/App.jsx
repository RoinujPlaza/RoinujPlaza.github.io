import { useCallback, useEffect, useRef, useState } from "react";
import { assets } from "./assets";
import { AboutDialog, CertificateLightbox, CommentsDialog, HireDialog } from "./components/Dialogs";
import { Scene } from "./components/Scene";
import { Sidebar, Topbar } from "./components/Sidebar";

const VIEWER_MINIMUM = 28;
const VIEWER_MAXIMUM = 46;

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

export default function App() {
  const [activePanel, setActivePanel] = useState(null);
  const [activeDialog, setActiveDialog] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProjectsMenuOpen, setIsProjectsMenuOpen] = useState(false);
  const [viewerCount, setViewerCount] = useState(35);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioUnavailable, setIsAudioUnavailable] = useState(false);
  const [isTypingResultVisible, setIsTypingResultVisible] = useState(false);
  const [dismissTypingResultSignal, setDismissTypingResultSignal] = useState(0);
  const audioRef = useRef(null);

  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  const closePanel = useCallback(() => {
    setActivePanel(null);
    setIsProjectsMenuOpen(false);
    setIsTypingResultVisible(false);
  }, []);

  const closeDialog = useCallback(() => setActiveDialog(null), []);

  const closeCertificate = useCallback(() => setCertificate(null), []);

  const closeEverything = useCallback(() => {
    setActivePanel(null);
    setActiveDialog(null);
    setCertificate(null);
    setIsDrawerOpen(false);
    setIsProjectsMenuOpen(false);
    setIsTypingResultVisible(false);
  }, []);

  const openDialog = useCallback((dialog) => {
    setActivePanel(null);
    setCertificate(null);
    setIsDrawerOpen(false);
    setIsProjectsMenuOpen(false);
    setIsTypingResultVisible(false);
    setActiveDialog(dialog);
  }, []);

  const togglePanel = useCallback((panel) => {
    setActiveDialog(null);
    setCertificate(null);
    setIsDrawerOpen(false);
    setIsProjectsMenuOpen(false);
    setIsTypingResultVisible(false);
    setActivePanel((currentPanel) => (currentPanel === panel ? null : panel));
  }, []);

  const toggleProjectsMenu = useCallback(() => {
    const willOpen = !isProjectsMenuOpen;

    setActiveDialog(null);
    setCertificate(null);
    setIsDrawerOpen(false);
    setIsTypingResultVisible(false);
    setIsProjectsMenuOpen(willOpen);
    setActivePanel(willOpen ? "projects" : null);
  }, [isProjectsMenuOpen]);

  const handleTypingResultVisibility = useCallback((isVisible) => {
    setIsTypingResultVisible(isVisible);
  }, []);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => document.body.classList.add("loaded"));

    return () => {
      cancelAnimationFrame(frameId);
      document.body.classList.remove("loaded", "no-scroll");
    };
  }, []);

  useEffect(() => {
    const viewerTimer = window.setInterval(() => {
      const change = Math.floor(Math.random() * 7) - 3;
      setViewerCount((count) => clamp(count + change, VIEWER_MINIMUM, VIEWER_MAXIMUM));
    }, 4000);

    return () => window.clearInterval(viewerTimer);
  }, []);

  useEffect(() => {
    const shouldLockBody = Boolean(activePanel || activeDialog || certificate || isDrawerOpen);
    document.body.classList.toggle("no-scroll", shouldLockBody);
  }, [activeDialog, activePanel, certificate, isDrawerOpen]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key !== "Escape") return;

      if (certificate) {
        closeCertificate();
        return;
      }

      if (activeDialog) {
        closeDialog();
        return;
      }

      if (isTypingResultVisible) {
        setDismissTypingResultSignal((signal) => signal + 1);
        return;
      }

      if (activePanel) {
        closePanel();
        return;
      }

      if (isDrawerOpen) closeDrawer();
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [
    activeDialog,
    activePanel,
    certificate,
    closeCertificate,
    closeDialog,
    closeDrawer,
    closePanel,
    isDrawerOpen,
    isTypingResultVisible,
  ]);

  async function toggleMusic() {
    const audio = audioRef.current;
    if (!audio || isAudioUnavailable) return;

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    audio.pause();
    setIsPlaying(false);
  }

  return (
    <>
      <Topbar
        isDrawerOpen={isDrawerOpen}
        onToggleDrawer={() => setIsDrawerOpen((isOpen) => !isOpen)}
        onHome={closeEverything}
      />

      <Sidebar
        isDrawerOpen={isDrawerOpen}
        isProjectsMenuOpen={isProjectsMenuOpen}
        viewerCount={viewerCount}
        isPlaying={isPlaying}
        isAudioUnavailable={isAudioUnavailable}
        onCloseDrawer={closeDrawer}
        onHome={closeEverything}
        onOpenAbout={() => openDialog("about")}
        onToggleProjects={toggleProjectsMenu}
        onToggleStack={() => togglePanel("stack")}
        onToggleTyping={() => togglePanel("typing")}
        onToggleMusic={toggleMusic}
        onOpenComments={() => openDialog("comments")}
        onOpenHire={() => openDialog("hire")}
      />

      <div
        className={`scrim${isDrawerOpen ? " open" : ""}`}
        aria-hidden="true"
        onClick={closeDrawer}
      />

      <Scene
        activePanel={activePanel}
        dismissTypingResultSignal={dismissTypingResultSignal}
        onClosePanel={closePanel}
        onOpenAbout={() => openDialog("about")}
        onTogglePanel={togglePanel}
        onTypingResultVisibilityChange={handleTypingResultVisibility}
      />

      <CommentsDialog isOpen={activeDialog === "comments"} onClose={closeDialog} />
      <AboutDialog
        isOpen={activeDialog === "about"}
        onClose={closeDialog}
        onOpenCertificate={setCertificate}
      />
      <CertificateLightbox certificate={certificate} onClose={closeCertificate} />
      <HireDialog isOpen={activeDialog === "hire"} onClose={closeDialog} />

      <audio
        ref={audioRef}
        src={assets.music}
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setIsAudioUnavailable(true)}
      />
    </>
  );
}
