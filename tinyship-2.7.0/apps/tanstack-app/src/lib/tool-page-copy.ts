import { danceExamples } from './dance-examples'

/** English copy for the two public tool routes; rendered in the initial HTML. */
export const toolPageCopy = {
  videoGenerator: {
    intro: 'This Rumpelstiltskin AI video generator brings a still portrait into a 10-second meme scene: a secretive shush, a startled princess, and a measured tiptoe dance. Upload your dancer, keep the included princess or choose her photo, and download the finished clip. One video is free without signup; allow a few minutes for rendering.',
    links: {
      danceLead: 'For a closer look at the steps and posture, see',
      guideLead: 'For screenshots of the upload and download controls, follow',
    },
    how: {
      heading: 'How It Works',
      steps: [
        { title: 'Add your references', body: 'Choose a clear photo of one dancer and optionally add a separate princess photo; the straw-corner setting is already included.' },
        { title: 'Create the clip', body: 'Confirm permission to use your photos and select Generate video to start the 10-second animation.' },
        { title: 'Save the result', body: 'Keep the page open while it renders, then preview and download your video when it is ready.' },
      ],
    },
    examples: danceExamples,
    faq: {
      heading: 'FAQ',
      items: [
        {
          question: 'Can I try the Rumpelstiltskin AI generator for free?',
          answer: 'Yes. One 10-second video is free, with no signup or payment required. Your browser and any linked account share that opportunity. A failed generation restores it; registering does not add another one.',
        },
        {
          question: 'How long does a Rumpelstiltskin AI video take to generate?',
          answer: 'The finished clip is 10 seconds long, but rendering usually takes a few minutes. Processing time varies with the provider queue, so keep this page open until the result appears.',
        },
        {
          question: 'Can I use my phone and choose both characters?',
          answer: 'Yes. Select the dancer photo from your phone gallery and optionally upload a separate princess photo. If you leave the princess upload empty, the included character is used. Preview and download the result in the same browser.',
        },
      ],
    },
    relatedHeading: 'Related Tools',
  },
  danceVideo: {
    intro: 'Use this rumpelstiltskin ai dance video generator to turn a portrait into a compact, theatrical tiptoe performance. The prepared sequence starts with a shush and a frightened princess reaction, then follows the dancer through side-steps and a footwork detail shot. You can make one 10-second clip free without creating an account.',
    links: {
      generatorLead: 'You can also use the same maker on',
      guideLead: 'If you need help with a control, the screenshots in',
      guideEnd: 'show each step from choosing a photo to saving the MP4.',
    },
    appearance: {
      heading: 'What the Dance Looks Like',
      paragraphs: [
        'The recognizable pose combines bent knees, lightly raised heels, a slight forward lean, and bent arms held away from the body. Small side-to-side steps transfer weight between the feet, with a gentle knee rebound and shoulder bounce rather than frantic tapping.',
        'The template asks for five shots in a fixed straw corner: the dancer signals shush, the seated princess reacts in fear, the dance begins, the camera cuts to the feet, and the dancer returns to finish. Warm, muted light and a subtle film texture give the scene a vintage fantasy feel. AI output can vary in timing, framing, and likeness.',
      ],
      image: '/images/dance/example-barn.png',
      alt: 'Illustrative still showing a full-body character in a vintage barn dance scene',
      caption: 'Illustrative still of the intended vintage dance mood, not a generated video result.',
    },
    how: {
      heading: 'How to Make a Dance Video',
      steps: [
        { title: 'Choose a readable dancer photo', body: 'Use a sharp image of one person with a visible face and, where possible, the full body and feet.' },
        { title: 'Pick the watching character', body: 'Keep the default princess or add her separate reference photo; the template asks the model to preserve each character’s outfit.' },
        { title: 'Generate and download', body: 'Confirm photo permission, select Generate video, and wait a few minutes before previewing and saving the finished clip.' },
      ],
    },
    faq: {
      heading: 'FAQ',
      items: [
        {
          question: 'Will the dance copy the original meme exactly?',
          answer: 'The template describes the meme’s shush, princess reaction, tiptoe posture, and footwork emphasis. It uses character photos and a fixed scene reference, so the generated motion and shot timing can differ from the original clip.',
        },
        {
          question: 'What helps the model show the dancer’s feet?',
          answer: 'Choose a full-body photo with space below and around the subject, and avoid cropping out the shoes. The prompt requests visible footwork, although the model can still change the framing.',
        },
        {
          question: 'Is the dance video maker free to try?',
          answer: 'You can make one 10-second video free without signing in. The optional princess photo is included, and downloading costs nothing. Your browser and any linked account share the same free opportunity.',
        },
      ],
    },
    navigationLabel: 'Explore Rumpelstiltskin tools',
  },
} as const
