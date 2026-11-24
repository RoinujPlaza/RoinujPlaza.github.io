import { assets } from "../assets";

export const projects = [
  {
    id: "cfg-quest",
    name: "CFG Quest",
    status: "published",
    description:
      "An interactive educational game that teaches context-free grammars through hands-on challenges.",
    tags: ["JavaScript", "HTML", "CSS"],
    url: "https://roinujplaza.github.io/CFG-Quest/",
    linkLabel: "live demo",
    icon: assets.javascript,
  },
  {
    id: "soundwaves",
    name: "Soundwaves",
    status: "published",
    description:
      "A browser-based sound and music experiment built for exploring interactive audio on the web.",
    tags: ["JavaScript", "Web Audio"],
    url: "https://roinujplaza.github.io/soundwaves/",
    linkLabel: "live demo",
    icon: assets.javascript,
  },
  {
    id: "gameragex",
    name: "Gameragex",
    status: "published",
    description:
      "A single-page game that teaches regular expressions by asking players to match generated patterns.",
    tags: ["JavaScript", "Game"],
    url: "https://roinujplaza.github.io/gameragex/",
    linkLabel: "live demo",
    icon: assets.javascript,
  },
  {
    id: "memory-hierarchy-visualizer",
    name: "Memory Hierarchy Visualizer",
    status: "source",
    description:
      "A Flutter visualizer with animated wiring and data-packet flow for exploring computer memory hierarchy.",
    tags: ["Dart", "Flutter"],
    url: "https://github.com/RoinujPlaza/memory-hierarchy-visualizer",
    linkLabel: "view source",
    icon: assets.flutter,
  },
  {
    id: "tabi",
    name: "Tabi",
    status: "source",
    description:
      "A simple messaging app built with Flutter and Dart for private conversations and connected communities.",
    tags: ["Dart", "Flutter", "Messaging"],
    url: "https://github.com/RoinujPlaza/Tabi",
    linkLabel: "view source",
    icon: assets.dart,
  },
];

export const stackSections = [
  {
    label: "frontend",
    tools: [
      { name: "HTML5", icon: assets.html },
      { name: "CSS3", icon: assets.css },
      { name: "JavaScript", icon: assets.javascript },
      { name: "Next.js", icon: assets.nextjs },
      { name: "Flutter", icon: assets.flutter },
    ],
  },
  {
    label: "backend",
    tools: [
      { name: "MongoDB", icon: assets.mongodb },
      { name: "PHP", icon: assets.php },
      { name: "Dart", icon: assets.dart },
      { name: "MySQL", icon: assets.mysql },
      { name: "MongoDB", icon: assets.mongodb },
    ],
  },
  {
    label: "tools",
    tools: [
      { name: "Git", icon: assets.git },
      { name: "GitHub", icon: assets.github },
      { name: "VS Code", icon: assets.vscode },
      { name: "Git", icon: assets.git },
      { name: "GitHub", icon: assets.github },
    ],
  },
];

export const typingSnippets = [
  "function greet(name) {\n  return `Hello, ${name}!`;\n}",
  '<div class="card">\n  <h1>Roinuj Plaza</h1>\n  <p>Hello World</p>\n</div>',
  ".card {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}",
  "const sum = (a, b) => a + b;\nconsole.log(sum(2, 3));",
  "async function fetchData(url) {\n  const res = await fetch(url);\n  return res.json();\n}",
  '<?php\n  echo "Hello, Roinuj!";\n?>',
  "SELECT * FROM users\nWHERE active = 1\nORDER BY name;",
  '<nav class="nav">\n  <a href="#">Home</a>\n</nav>',
];

export const socialLinks = [
  { name: "GitHub", icon: "github", url: "https://github.com/RoinujPlaza" },
  {
    name: "Instagram",
    icon: "instagram",
    url: "https://www.instagram.com/roinuj.class",
  },
  {
    name: "Facebook",
    icon: "facebook",
    url: "https://www.facebook.com/roinuj.nehcterg.calimpong.plaza/",
  },
  { name: "Telegram", icon: "telegram", url: "https://t.me/not_roi" },
];

export const certificates = [
  { id: "certificate-1", image: assets.firstCertificate, alt: "Certificate of participation" },
  { id: "certificate-2", image: assets.secondCertificate, alt: "Certificate of appreciation" },
];
