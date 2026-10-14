/** The shared source for page metadata, home navigation and sitemap URLs. */
function page(path: string, anchorText: string, targetKeyword: string, description: string, category: string) {
  return { path, href: path, targetKeyword, anchorText, title: anchorText, h1: anchorText, description, category } as const
}

export const pageRegistry = {
  home: {
    ...page('/', 'Rumpelstiltskin AI', 'rumpelstiltskin ai', '', 'Home'),
    title: 'Rumpelstiltskin AI - Turn Any Photo Into the Dance Video',
    h1: 'Rumpelstiltskin AI Video Maker',
    description: 'Type in a photo, get the Rumpelstiltskin AI dance video in seconds. The free Rumpelstiltskin AI generator behind the viral meme.',
  },
  videoGenerator: {
    ...page(
    '/rumpelstiltskin-ai-video-generator', 'Rumpelstiltskin AI Video Generator', 'rumpelstiltskin ai video generator',
    'Upload a photo and the Rumpelstiltskin AI video generator turns it into the viral dance clip in under a minute. Free to try on phone or desktop.', 'Video generators',
    ),
    title: 'Rumpelstiltskin AI Video Generator - Free, Online, No Signup',
  },
  danceVideo: {
    ...page(
    '/rumpelstiltskin-dance-video', 'Rumpelstiltskin Dance Video Generator', 'rumpelstiltskin ai dance video generator',
    'Turn a photo into a Rumpelstiltskin dance video with a prepared AI dance template.', 'Video generators',
    ),
    title: 'Rumpelstiltskin Dance Video Generator - Free AI Dance Maker',
  },
  bestGenerators: {
    ...page(
    '/best-rumpelstiltskin-ai-generators', 'Best Rumpelstiltskin AI Generators', 'best rumpelstiltskin ai generators',
    'Compare Rumpelstiltskin AI generators by free allowances, sign-in requirements, generation times and use cases.', 'Compare tools',
    ),
    title: 'Best Rumpelstiltskin AI Generators (Compared)',
  },
  meme: {
    ...page(
    '/rumpelstiltskin-meme', 'Rumpelstiltskin Meme', 'rumpelstiltskin meme',
    'Yes, the Rumpelstiltskin meme is AI. Where it came from, why it blew up, and how to put yourself in the dance video in 30 seconds.', 'Meme and movie',
    ),
    title: 'Rumpelstiltskin Meme - Is It AI? How to Make Your Own',
    h1: 'The Rumpelstiltskin Meme',
  },
  howTo: {
    ...page(
    '/how-to-make-rumpelstiltskin-ai-video', 'How to Make a Rumpelstiltskin AI Video', 'how to make rumpelstiltskin ai video',
    'Make a Rumpelstiltskin AI video in four steps: upload your photo, use the dance template, generate a 10-second clip and download the MP4.', 'Guides',
    ),
    title: 'How to Make a Rumpelstiltskin AI Video (Step by Step)',
  },
  movie1987: {
    ...page(
    '/1987-rumpelstiltskin', '1987 Rumpelstiltskin', '1987 rumpelstiltskin',
    'The 1987 Rumpelstiltskin film stars Billy Barty. Learn why the viral AI tiptoe dance is mistaken for a scene from that movie.', 'Meme and movie',
    ),
    title: '1987 Rumpelstiltskin - The Dance Scene Behind the AI Meme',
    h1: '1987 Rumpelstiltskin: The Dance Scene Behind the Meme',
  },
} as const

export const homePage = pageRegistry.home
export const moreAiVideoTools = [
  pageRegistry.videoGenerator,
  pageRegistry.danceVideo,
  pageRegistry.bestGenerators,
  pageRegistry.meme,
  pageRegistry.howTo,
  pageRegistry.movie1987,
] as const

/** Planned navigation targets enter the sitemap only after a page route exists. */
export function registeredSitemapPaths(activePaths: readonly string[]): string[] {
  const active = new Set(activePaths)
  const registered = Object.values(pageRegistry).map((entry) => entry.path)
  return [...registered.filter((path) => active.has(path)), ...activePaths.filter((path) => !registered.includes(path))]
}
