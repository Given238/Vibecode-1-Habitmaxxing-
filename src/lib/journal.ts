import type { Habit } from '../types'

export const JOURNAL_MIN_SENTENCES = 2
export const JOURNAL_MAX_SENTENCES = 4
const MIN_WORDS_PER_SENTENCE = 3

/** Split on sentence-ending punctuation; each chunk needs enough words. */
export function countSentences(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0

  const chunks = trimmed
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).filter(Boolean).length >= MIN_WORDS_PER_SENTENCE)

  if (chunks.length > 0) return chunks.length

  const words = trimmed.split(/\s+/).filter(Boolean).length
  return words >= MIN_WORDS_PER_SENTENCE * 2 ? 1 : 0
}

export function isValidJournal(text: string): boolean {
  const n = countSentences(text)
  return n >= JOURNAL_MIN_SENTENCES && n <= JOURNAL_MAX_SENTENCES
}

export function journalHint(text: string): string {
  const n = countSentences(text.trim())
  if (!text.trim()) {
    return `Write ${JOURNAL_MIN_SENTENCES}–${JOURNAL_MAX_SENTENCES} sentences about what you actually did (end each with . ! or ?).`
  }
  if (n < JOURNAL_MIN_SENTENCES) {
    return `${n} sentence${n === 1 ? '' : 's'} detected — need at least ${JOURNAL_MIN_SENTENCES}.`
  }
  if (n > JOURNAL_MAX_SENTENCES) {
    return `${n} sentences — max ${JOURNAL_MAX_SENTENCES}. Combine or trim.`
  }
  return `${n} sentences — good to log.`
}

export function hasValidLog(habit: Habit, iso: string): boolean {
  const entry = habit.completions[iso]
  return typeof entry === 'string' && isValidJournal(entry)
}
