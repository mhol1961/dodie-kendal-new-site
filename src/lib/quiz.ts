// Single source of truth for the "Is QHHT right for you?" quiz.
// Imported by both the QhhtQuiz.astro component (to render) and
// /api/quiz.ts (to validate + map answers to GHL tags). Keep them in sync by
// keeping them here.

export interface QuizOption {
  value: string;
  label: string;
}

export interface QuizQuestion {
  /** Stable id — becomes the form field name and the tag namespace. */
  id: string;
  question: string;
  /** Short helper line shown under the question. */
  help?: string;
  options: QuizOption[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'draw',
    question: "What's drawing you to QHHT right now?",
    help: 'Pick the one that resonates most.',
    options: [
      { value: 'clarity-decision', label: 'Clarity on a decision' },
      { value: 'recurring-pattern', label: 'Understanding a pattern that keeps repeating' },
      { value: 'past-lives', label: 'Curiosity about past lives' },
      { value: 'spiritual-connection', label: 'A deeper spiritual connection' },
      { value: 'physical-sensation', label: "A physical sensation I can't explain" },
      { value: 'something-else', label: 'Something else entirely' },
    ],
  },
  {
    id: 'experience',
    question: 'Have you explored hypnosis, meditation, or energy work before?',
    options: [
      { value: 'regularly', label: 'Yes, regularly' },
      { value: 'a-little', label: 'A little' },
      { value: 'first-time', label: 'This would be my first time' },
    ],
  },
  {
    id: 'mindset',
    question: 'When you imagine a session, what feels most true?',
    options: [
      { value: 'curious-nervous', label: "I'm curious, but a little nervous" },
      { value: 'ready-open', label: "I'm ready and open" },
      { value: 'have-questions', label: 'I have questions before I commit' },
    ],
  },
  {
    id: 'hope',
    question: 'What would make this feel worth it for you?',
    options: [
      { value: 'specific-answer', label: 'A clear answer to a specific question' },
      { value: 'release', label: 'A sense of release' },
      { value: 'direction', label: 'Direction for a decision' },
      { value: 'experience', label: 'To simply experience it for myself' },
    ],
  },
  {
    id: 'timing',
    question: 'How soon are you hoping to do this?',
    options: [
      { value: 'asap', label: 'As soon as I can' },
      { value: 'soon', label: 'In the next month or two' },
      { value: 'exploring', label: 'Just exploring for now' },
    ],
  },
];

/** Valid value set per question id — used by the API to validate answers. */
export const QUIZ_VALUES: Record<string, string[]> = Object.fromEntries(
  QUIZ_QUESTIONS.map((q) => [q.id, q.options.map((o) => o.value)])
);

/**
 * Map a validated set of answers to GHL tags. Tags auto-create on apply, so no
 * GHL UI setup is needed, and Dodie's workflows can trigger on any of them.
 * Example: { draw: 'release' } → 'quiz-draw-release'.
 */
export function answersToTags(answers: Record<string, string>): string[] {
  const tags = ['quiz-completed', 'site_v2'];
  for (const [id, value] of Object.entries(answers)) {
    tags.push(`quiz-${id}-${value}`);
  }
  return tags;
}

/**
 * What the quiz shows after a successful submit. Copy is Dodie's voice; keep it
 * to facts the site already states and never promise an outcome.
 */
export interface QuizResult {
  id: string;
  /** Every listed answer must match. The first approved match wins. */
  match: Record<string, string>;
  /** Flip to true only after Dodie approves the wording. */
  approved: boolean;
  heading: string;
  body: string;
}

export const GENERAL_RESULT: QuizResult = {
  id: 'general',
  match: {},
  approved: true,
  heading: 'Start with a conversation.',
  body:
    "Thank you for trusting me with your answers. I read every one myself, and I'll be in touch personally. " +
    "Whatever brought you here, the gentlest first step is a free 30-minute call: you can ask me anything, and we'll see together whether a session feels right for you.",
};

// DRAFTS awaiting Dodie's approval. QhhtQuiz.astro filters to approved ones at
// build time, so unapproved wording never reaches the page or its JS.
export const QUIZ_RESULTS: QuizResult[] = [
  {
    id: 'clarity-decision',
    match: { draw: 'clarity-decision' },
    approved: false,
    heading: 'You are looking for clarity.',
    body:
      "A decision you keep turning over is one of the things people bring to a session. Before we begin, we spend about two hours in conversation shaping the questions you most want to ask, and you take the audio recording home to listen back to. A free 30-minute call is an easy way to talk through what you'd bring.",
  },
  {
    id: 'recurring-pattern',
    match: { draw: 'recurring-pattern' },
    approved: false,
    heading: 'A pattern that keeps coming back.',
    body:
      "Wanting to understand why something keeps repeating is a very human reason to be curious about QHHT. In a session you set the agenda, so we'd shape your questions around that pattern together. If you'd like to talk it through first, a free 30-minute call is the gentlest place to start.",
  },
  {
    id: 'past-lives',
    match: { draw: 'past-lives' },
    approved: false,
    heading: 'Curious about past lives.',
    body:
      "Curiosity is a lovely place to begin. Past-life memories may come up in a session, but QHHT is broader than that: it's a conversation with the deepest part of you, and it goes wherever that leads. A free 30-minute call is a relaxed way to ask me what that's like.",
  },
  {
    id: 'spiritual-connection',
    match: { draw: 'spiritual-connection' },
    approved: false,
    heading: 'Looking for a deeper connection.',
    body:
      "QHHT is a deeply respectful conversation with your Subconscious, the part of you that's been there all along. We'd spend unhurried time together, in person here in Stuart, Florida, and you keep the recording. If you'd like to see whether it feels right, a free 30-minute call is a good first step.",
  },
  {
    id: 'physical-sensation',
    match: { draw: 'physical-sensation' },
    approved: false,
    heading: 'Something you feel but can’t explain.',
    body:
      "Thank you for telling me. QHHT is not medical treatment and never a replacement for your doctor or other licensed care, so please keep them in the loop about anything physical. If you're curious about exploring it alongside that care, a free 30-minute call is a good place to ask me your questions.",
  },
  {
    id: 'something-else',
    match: { draw: 'something-else' },
    approved: false,
    heading: 'Something all your own.',
    body:
      "You don't need a tidy reason to be here. In a session you set the agenda, and we spend the first couple of hours in conversation finding the questions that matter to you. A free 30-minute call is a relaxed way to tell me what's on your mind.",
  },
];

/** The first approved result whose `match` fits the answers, else the general one. */
export function resultFor(answers: Record<string, string>, results: QuizResult[]): QuizResult {
  return (
    results.find((r) => r.approved && Object.entries(r.match).every(([id, v]) => answers[id] === v)) ??
    GENERAL_RESULT
  );
}
