// data.js — All site content lives here. Edit this file to update the site.
const SITE_DATA = {
  meta: {
    title: "Spinzi — Builder",
    description: "Student developer. Builder. Creator. I write code with meaning.",
    author: "Spinzi",
    url: "https://spinzi.github.io"
  },

  hero: {
    greeting: "hey, I'm",
    name: "Spinzi",
    tagline: "I build software with meaning.",
    subtext: "Student developer · Future engineer · OnHisa team · Builder of things that matter.",
    cta: [
      { label: "See my work", href: "#projects", variant: "primary" },
      { label: "GitHub", href: "https://github.com/Spinzi", variant: "secondary", external: true }
    ]
  },

  about: {
    paragraphs: [
      "I'm a student developer who believes code can carry meaning. I build tools, learn systems, and try to write software the way I'd want to read a book — clearly, purposefully, with something real to say.",
      "Part of the OnHisa team. Interested in systems programming, game dev, and the craft of building things from scratch. I like understanding how things work at the bottom.",
      "My faith shapes how I think about what I build and why. Not everything needs to be useful to be worth making — but what I make, I want to matter."
    ],
    tags: ["C++", "Systems", "Web", "Game Dev", "OnHisa", "Learner"]
  },

  verse: {
    reference: "Philippians 4:6–7",
    translation: "NIV",
    text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus."
  },

  projects: [
    {
      id: "bio-app",
      title: "Bio App",
      short: "An interactive biology study app built as a learning project.",
      description: "A web-based biology reference and study tool. Built to make reviewing biology concepts faster and more visual. One of my first real web projects — where I learned to structure HTML around content instead of code.",
      tech: ["HTML", "CSS", "JavaScript"],
      tags: ["Education", "Web", "Study Tool"],
      status: "live",
      github: "https://github.com/Spinzi",
      demo: null,
      notes: "Part of the OnHisa learning projects series."
    },
    {
      id: "cpp-strings",
      title: "C++ Strings Reference",
      short: "A clear, visual reference for C++ string functions.",
      description: "A hand-crafted reference page explaining C++ string functions. Built because I was tired of reading dry documentation. If I had to learn it, I wanted to learn it in a way I'd actually remember.",
      tech: ["C++", "HTML", "CSS"],
      tags: ["C++", "Reference", "Systems"],
      status: "live",
      github: "https://github.com/Spinzi",
      demo: null,
      notes: "Part of a larger effort to teach C++ accessibly."
    },
    {
      id: "vector-class",
      title: "Custom Vector Class",
      short: "A C++ Vector implementation built from scratch.",
      description: "Rebuilt the C++ std::vector from scratch to understand dynamic memory, templates, and RAII. One of the most educational projects I've done — reading the spec, then writing the implementation without looking at the source.",
      tech: ["C++", "Data Structures", "Templates"],
      tags: ["C++", "Systems", "From Scratch"],
      status: "live",
      github: "https://github.com/Spinzi",
      demo: null,
      notes: "Understanding how the standard library works by rebuilding it."
    },
    {
      id: "geography",
      title: "Geography Project",
      short: "An interactive geography study page.",
      description: "A geography learning tool built for a school project that turned into something more polished. Covers maps, facts, and region-based content in a clean layout.",
      tech: ["HTML", "CSS", "JavaScript"],
      tags: ["Education", "Geography", "Web"],
      status: "live",
      github: "https://github.com/Spinzi",
      demo: null,
      notes: null
    },
    {
      id: "history",
      title: "History Project",
      short: "Historical content presented as a readable web experience.",
      description: "A history project that focused on readable typography and clear information hierarchy. I wanted history to feel like a story, not a textbook.",
      tech: ["HTML", "CSS"],
      tags: ["Education", "History", "Design"],
      status: "live",
      github: "https://github.com/Spinzi",
      demo: null,
      notes: null
    }
  ],

  social: [
    { label: "GitHub", href: "https://github.com/Spinzi", icon: "github" },
    { label: "Contact", href: "https://spinzi.github.io/contact.html", icon: "mail" }
  ],

  footer: {
    text: "Built by Spinzi · No frameworks, no templates, just code.",
    year: 2025
  }
};
