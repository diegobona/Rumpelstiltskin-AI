import { pageRegistry } from './page-registry'

export const memeSources = {
  afi: { href: 'https://catalog.afi.com/Film/57804-RUMPELSTILTSKIN', label: 'AFI Catalog' },
  history: { href: 'https://knowyourmeme.com/memes/ai-rumpelstiltskin-tip-toein-in-my-jordans', label: 'Know Your Meme' },
  reporting: { href: 'https://www.nbclosangeles.com/entertainment/entertainment-news/ai-generated-rumpelstiltskin-meme/3952695/', label: 'NBC News reporting' },
} as const

export const memeArticleCopy = {
  ai: {
    heading: 'Is the Rumpelstiltskin Meme AI?',
    answer: 'Yes. The viral video of an imp-like dancer performing for a frightened woman in a straw-filled setting was generated with AI. Its old-film appearance led viewers to mistake it for footage from the 1987 movie Rumpelstiltskin.',
    explanation: 'That answer applies to this particular viral clip. Rumpelstiltskin is also the title of a real film, so finding a movie listing with that name does not establish where a reposted dance came from. Check the clip’s source before treating a caption such as “Rumpelstiltskin (1987)” as a credit.',
  },
  origin: {
    heading: 'Where the Rumpelstiltskin Meme Came From',
    paragraphs: [
      'According to Know Your Meme, the Instagram pages Stroinaya, Neuroferma and Anna Glinskaya jointly posted the AI video on August 27, 2026. Its source-linked timeline then follows captioned edits and character replacements across TikTok and X in late September and early October.',
      'The familiar music edit pairs the dance with Riff Raff’s “Tip Toe Wing In My Jawwdinz.” The music and joke captions gave people ways to reuse the short performance, while AI replacements let them put another character in the dancer’s place.',
    ],
    more: 'For the cast and film credits that often get mixed into this story, read about',
    link: pageRegistry.movie1987,
  },
  make: {
    heading: 'How to Make Your Own Rumpelstiltskin Meme',
    intro: 'You can make a new version with your own dancer photo. This site uses a prepared 10-second dance sequence with a princess reaction and a footwork detail shot.',
    steps: [
      'Open the maker and select Choose dancer photo. Pick one JPG, PNG or WebP file up to 10 MB showing one person with a clearly visible face; no account is required.',
      'Keep the included princess or select Choose princess photo to replace her. The straw-corner setting and dance sequence are already selected.',
      'Confirm the photo-permission checkbox and select Generate video. Allow a few minutes for processing and keep the page open.',
      'Watch the result, then select Download video to save the MP4. Check the face and footwork before sharing it.',
    ],
    timing: 'Generation time depends on the service queue. A 30-second turnaround is not guaranteed, and a new result may differ from the meme’s exact steps or cut timing.',
    toolLead: 'Start with',
    homeLead: 'The same maker is on',
    guideLead: 'For screenshots of each control, follow',
  },
  faq: {
    heading: 'FAQ',
    items: [
      {
        question: 'Is Billy Barty the dancer in the meme?',
        answer: 'Billy Barty played Rumpelstiltskin in the real 1987 film. The viral AI dancer is a separate character; the movie’s casting credit does not identify him.',
        source: memeSources.afi,
        secondSource: memeSources.reporting,
      },
      {
        question: 'Will my video copy the original dance exactly?',
        answer: 'The maker prompts a shush gesture, a frightened princess reaction and measured tiptoe dancing. AI generation can change the pacing, framing or movement, so preview the result before you download it.',
      },
      {
        question: 'Can I try making a meme for free?',
        answer: 'You can make one 10-second video free without signing up. The limit applies to your browser and any linked account. A failed generation restores the opportunity; creating an account does not add another one.',
      },
    ],
  },
} as const

export const movieArticleCopy = {
  scene: {
    heading: 'What the 1987 Scene Is',
    correction: 'The tiptoe dance circulating as a “1987 scene” is an AI-generated video. It is not a scene from the real film Rumpelstiltskin. NBC News reported the mistaken movie attribution during the meme’s spread.',
    film: 'Rumpelstiltskin was released in 1987 as part of Cannon’s Movie Tales series of live-action fairy-tale musicals. The AFI Catalog credits David Irving as director and writer, Billy Barty as Rumpelstiltskin, and Amy Irving as Katie, the miller’s daughter.',
    distinction: 'Billy Barty’s performance belongs to that film. The dance meme’s synthetic character should not be presented as footage of him.',
  },
  revival: {
    heading: 'Why It Became a Meme Again',
    timeline: 'The 2026 trend brought the name Rumpelstiltskin back into circulation through a new AI clip. Know Your Meme documents its August upload and the music edits that spread in late September and early October.',
    mechanism: 'NBC News describes viewers looking for an old film, followed by remixes with other characters in the dancer’s place. That helps explain the renewed attention to the 1987 title: the old-movie look encouraged the connection, even though the clip had a different source.',
    more: 'The upload history and music edit are covered in',
    link: pageRegistry.meme,
  },
  make: {
    heading: 'Make Your Own Version',
    intro: 'Use a photo to make your own interpretation of the dance. The maker supplies the straw corner and a default princess; you choose the dancer and can replace the princess with a second photo.',
    expectations: 'The result is a newly generated 10-second MP4. Allow a few minutes for rendering, then check the character likeness and steps. It is a recreation of the meme, with motion that can vary between generations.',
    toolLead: 'Open',
    guideLead: 'or follow the illustrated guide:',
  },
} as const
