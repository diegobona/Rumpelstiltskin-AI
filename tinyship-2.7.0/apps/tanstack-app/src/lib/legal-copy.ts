export const legalDetails = {
  operator: 'ColdStone co.',
  supportEmail: 'zw83716@gmail.com',
  updated: 'October 14, 2026',
  updatedLabel: 'Last updated:',
  contactHeading: 'Contact',
  contactLead: 'For support, privacy requests or questions about these terms, email',
} as const

export const legalPages = {
  privacy: {
    path: '/privacy-policy',
    label: 'Privacy Policy',
    title: 'Privacy Policy | Rumpelstiltskin AI',
    description: 'How ColdStone co. handles account information, uploaded photos and video generation data for Rumpelstiltskin AI.',
    intro: 'ColdStone co. operates Rumpelstiltskin AI. This policy describes the information used to provide accounts and photo-to-video generation.',
    sections: [
      {
        heading: 'Information used by the service',
        paragraphs: [
          'When you use the free trial without signing up, the service creates an anonymous session with a generated internal identifier. If you create an account, it stores your name, email address, authentication records and credit transactions. Email-and-password accounts use a password hash. Session records can include your IP address and browser information.',
          'When you generate a video, the service processes the photos you select, the prepared generation instructions, job status and a link to the resulting video. Support emails contain the information you choose to send us.',
        ],
      },
      {
        heading: 'Why we use this information',
        paragraphs: [
          'Account and session data let you sign in. Credit records track generation charges and refunds. Uploaded photos and generation instructions are needed to create your requested video. Technical logs help diagnose errors and protect the service from misuse.',
          'We use information sent to the support address to respond to your request. Avoid including passwords, API keys or unnecessary personal information in your message.',
        ],
      },
      {
        heading: 'Storage and video processing',
        paragraphs: [
          'Cloudflare provides the application hosting, D1 account database and R2 photo storage. AutoDL receives the reference-image URLs and generation instructions to run the video workflow. These providers process data on their own infrastructure and may process it outside your country.',
          'Uploaded reference photos currently use public storage URLs so the video provider can retrieve them. Anyone who has such a URL can access the image. Do not upload confidential documents or images you need to keep private. A local preview alone does not upload a photo; the upload begins when you start generation.',
        ],
      },
      {
        heading: 'Retention and deletion requests',
        paragraphs: [
          'There is currently no automatic deletion schedule for uploaded photos. Account and credit records remain until removed through administration or a supported deletion process. Generated-video links supplied by the provider can expire, so download the result while it is available.',
          'To request access, correction or deletion, email us and describe the records or uploads involved. If you used a guest session, include the approximate generation time and any task or image URL you retained. If you have an account, contact us from its email address. We may need information to verify the request. Deleting an application record does not necessarily remove provider-retained copies.',
        ],
      },
      {
        heading: 'Cookies and analytics',
        paragraphs: [
          'A signed, HttpOnly visitor cookie lasts up to one year and links this browser to its free-video allowance. Database records enforce that allowance across sessions and account registration. Clearing cookies or using a different device can affect this recognition. We also use short-lived, keyed hashes of Cloudflare-provided IP addresses to limit request bursts; the trial rate counters do not store raw IP addresses.',
          'The authentication system uses session cookies, and the interface may store your theme preference in the browser. The current tab also keeps your latest video task ID for up to 24 hours so a refresh can resume checking the result; photos are not stored in this browser record. The application currently has no active analytics identifier and does not load an analytics beacon by default.',
          'If we enable an analytics service or change how personal information is processed, we will update this policy to describe that change.',
        ],
      },
    ],
  },
  terms: {
    path: '/terms-of-service',
    label: 'Terms of Service',
    title: 'Terms of Service | Rumpelstiltskin AI',
    description: 'Terms for using the Rumpelstiltskin AI photo-to-video tool operated by ColdStone co., including uploads, credits and generated results.',
    intro: 'These terms cover your use of Rumpelstiltskin AI, operated by ColdStone co. Please read them before uploading photos or starting a generation.',
    sections: [
      {
        heading: 'The service',
        paragraphs: [
          'The tool creates a new video from character photos and a prepared dance template. It uses an AI generation provider. Faces, motion and shot timing can vary; a particular likeness, exact choreography or completion time is not guaranteed.',
          'Rumpelstiltskin AI is an independent tool. It is not presented as an official service of the 1987 film, its performers or the creators of the viral meme.',
        ],
      },
      {
        heading: 'Your account and photos',
        paragraphs: [
          'Keep your sign-in details secure and provide an email address you control. You are responsible for activity you authorize through your account.',
          'Upload only photos you have permission to use, including the permission needed to depict identifiable people. Do not use the tool to harass people, commit fraud or create unlawful content. We may restrict access when the service is misused.',
        ],
      },
      {
        heading: 'Permission to process uploads',
        paragraphs: [
          'You keep any rights you already hold in your uploads. By starting generation, you allow us and the service providers to store and process those uploads to produce and deliver the requested video.',
          'You are responsible for checking whether your intended use of an output respects other people’s rights. The service does not guarantee that an AI output is unique or that it grants exclusive rights in the result.',
        ],
      },
      {
        heading: 'Free trial and generation',
        paragraphs: [
          'The current offer is one successful 10-second video without registration or payment. The site enforces the allowance through browser and account records. Creating an account or signing out does not add another opportunity. An active job reserves the opportunity; checking its status does not start another generation.',
          'When the provider reports a failed generation and the internal refund completes, the free opportunity is restored. Contact support if it remains unavailable after a failure. A completed video that differs from your expectations still counts as a successful generation. Short-term network limits may temporarily delay retries.',
          'Any future paid offer must show its price and applicable purchase terms before payment. These terms do not establish an unannounced subscription or automatic renewal.',
        ],
      },
      {
        heading: 'Availability and downloads',
        paragraphs: [
          'Generation can take several minutes and depends on provider availability. Keep the tool open while a job runs, preview the result, and download the MP4 to your device. The application does not currently provide a permanent video library.',
          'Temporary links and unfinished job status can become unavailable. Contact support with your account email and the approximate generation time if you need help with a charge or interrupted job.',
        ],
      },
      {
        heading: 'Changes and applicable rights',
        paragraphs: [
          'We may update the tool and these terms. The date on this page identifies the current version. Nothing in these terms is intended to remove rights that applicable law does not allow us to exclude.',
        ],
      },
    ],
  },
} as const
