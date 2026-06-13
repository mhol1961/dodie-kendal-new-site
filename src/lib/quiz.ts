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
