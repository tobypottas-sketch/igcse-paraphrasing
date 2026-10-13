const EVENT_TYPES = new Set(['app_open', 'active_time', 'question_attempt', 'exercise_result']);
const MODES = new Set(['practice', 'exam']);
const OUTCOMES = new Set(['correct', 'close', 'try_again', 'empty']);
const QUESTION_TYPES = new Set([
  'phrase_match',
  'sentence_match',
  'synonym_write',
  'paraphrase_write',
  'ex1',
  'ex2',
  'ex3',
  'ex4'
]);

function cleanLabel(value, maxLength) {
  if (value == null || value === '') return undefined;
  const text = String(value).trim();
  if (!text) return undefined;
  return text.slice(0, maxLength);
}

function cleanInteger(value, min, max, label) {
  if (value == null) return undefined;
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    throw new Error(`Invalid ${label}.`);
  }
  return number;
}

function sanitizeMetadata(input) {
  const source = input && typeof input === 'object' ? input : {};
  const output = {};

  if (source.attempt_number != null) {
    output.attempt_number = cleanInteger(source.attempt_number, 1, 100, 'attempt number');
  }
  if (source.word_count != null) {
    output.word_count = cleanInteger(source.word_count, 0, 1000, 'word count');
  }
  if (source.overlap_count != null) {
    output.overlap_count = cleanInteger(source.overlap_count, 0, 1000, 'overlap count');
  }
  if (OUTCOMES.has(source.outcome)) output.outcome = source.outcome;
  if (QUESTION_TYPES.has(source.question_type)) output.question_type = source.question_type;

  return output;
}

export function buildTrackingEvent(input = {}) {
  if (!EVENT_TYPES.has(input.event_type)) throw new Error('Invalid tracking event type.');
  if (input.mode != null && !MODES.has(input.mode)) throw new Error('Invalid tracking mode.');

  const event = {
    app_key: 'paraphrasing',
    event_type: input.event_type,
    metadata: sanitizeMetadata(input.metadata)
  };

  const activityId = cleanLabel(input.activity_id, 160);
  const skill = cleanLabel(input.skill, 80);
  const setId = cleanLabel(input.set_id, 40);
  if (activityId) event.activity_id = activityId;
  if (skill) event.skill = skill;
  if (setId) event.set_id = setId;
  if (input.mode != null) event.mode = input.mode;
  if (typeof input.strong === 'boolean') event.strong = input.strong;

  const score = cleanInteger(input.score, 0, 10000, 'score');
  const maxScore = cleanInteger(input.max_score, 1, 10000, 'max score');
  const activeSeconds = cleanInteger(input.active_seconds, 1, 600, 'active seconds');
  if (score != null) event.score = score;
  if (maxScore != null) event.max_score = maxScore;
  if (score != null && maxScore != null && score > maxScore) throw new Error('Score cannot exceed max score.');
  if (activeSeconds != null) event.active_seconds = activeSeconds;

  return event;
}

export function shouldCountActiveTime({ visible, lastInteractionAt, now = Date.now(), idleMs = 120000 }) {
  return Boolean(visible) && Number.isFinite(lastInteractionAt) && now - lastInteractionAt <= idleMs;
}
