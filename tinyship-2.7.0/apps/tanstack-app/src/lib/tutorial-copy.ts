export const tutorialCopy = {
  introBeforeLink: 'Open ',
  introAfterLink: ' and choose your photos. You can make one free 10-second video without signing up; keep cookies enabled so the site can remember your trial and result.',
  toolLinks: {
    generatorLead: 'These instructions also work on',
    danceLead: 'For details of the movement in the included preset, see',
  },
  steps: [
    {
      id: 'choose-photo',
      heading: '1. Choose your dancer photo',
      paragraphs: [
        'Click "Choose dancer photo" in the "Dancer photo · required" box and select a JPG, PNG, or WebP file up to 10 MB from your device.',
        'Use one person per photo and include as much of the body as possible, including the feet. Check the preview and click "Change photo" if you need a different image.',
      ],
      image: '/images/tutorial/01-choose-photo.png',
      width: 549,
      height: 538,
      alt: 'Maker screenshot showing a selected example dancer photo, the Change photo button and the 10 MB file limit',
      caption: 'Photo selection in the maker, using an illustrative sample image.',
    },
    {
      id: 'choose-dance',
      heading: '2. Use the included dance template',
      paragraphs: [
        'The maker uses one preset: a 10-second dance in a straw corner. The background and dance sequence are already selected.',
        'Keep "Default princess included", or click "Choose princess photo" to replace her with a second JPG, PNG, or WebP file up to 10 MB.',
        'The template asks the model to keep both characters\' reference outfits and use the fixed straw background.',
      ],
      image: '/images/tutorial/02-dance-setting.png',
      width: 549,
      height: 300,
      alt: 'Maker screenshot showing the included princess, Choose princess photo button and optional photo upload instructions',
      caption: 'Keep the included princess or replace her with your own photo.',
    },
    {
      id: 'generate-video',
      heading: '3. Generate the video',
      paragraphs: [
        'Tick "I have permission to use the photos I upload." and click "Generate video".',
        'Wait while the status reads "Generating your dance video…" and keep the page open; allow several minutes for the 10-second clip.',
        'The finished preview appears under "Your dance video" when the job completes.',
      ],
      image: '/images/tutorial/03-generate-video.png',
      width: 553,
      height: 300,
      alt: 'Maker screenshot showing photo permission and the Generate video button during a sample generation',
      caption: 'Generation controls in a sample processing state. This UI screenshot does not show a generated result.',
    },
    {
      id: 'download-video',
      heading: '4. Download the MP4',
      paragraphs: [
        'When "Your video is ready." appears, use the preview player to check the clip, then click "Download video" to save the MP4.',
        'The download is named rumpelstiltskin-ai-dance.mp4; on a phone, look in your browser\'s downloads if it does not open automatically.',
        'If the download button fails, use "Open video" and your browser\'s option to save the video.',
      ],
      image: '/images/tutorial/04-download-video.png',
      width: 509,
      height: 300,
      alt: 'Maker screenshot showing Your video is ready, the enabled Download video button and Open video link in a sample completion state',
      caption: 'Download controls in a sample completion state. The screenshot shows the buttons to use when your own video is ready.',
    },
  ],
  problems: {
    heading: 'Common Problems',
    items: [
      {
        question: 'Why is Generate video greyed out?',
        answer: 'Choose a dancer photo and tick the photo-permission checkbox. Changing either reference photo clears that checkbox, so tick it again after making changes. The button also stays disabled while a video is running or after your free video has been used; the notice above the photos explains which applies.',
      },
      {
        question: 'What if the video is taking too long?',
        answer: 'A 10-second clip can take several minutes to render. Keep the page open. If a timeout or status-check error appears, click "Check video status" to check the existing job; that action does not submit another generation.',
      },
      {
        question: 'Why does the face or dance look different from the reference?',
        answer: 'The model generates new motion, so facial details and shot timing can vary. Use a sharp photo with the face and body visible before starting. A completed video uses your free opportunity even if the result differs from what you expected.',
      },
    ],
  },
} as const
