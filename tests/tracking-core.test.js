import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTrackingEvent, shouldCountActiveTime } from '../tracking-core.js';

test('buildTrackingEvent keeps only approved analytics fields', () => {
  const event = buildTrackingEvent({
    event_type: 'question_attempt',
    activity_id: 'starter:phrase_match:1',
    skill: 'phrase_match',
    set_id: 'starter',
    mode: 'practice',
    strong: true,
    score: 1,
    max_score: 1,
    metadata: {
      attempt_number: 2,
      outcome: 'correct',
      answer_text: 'THIS MUST NEVER LEAVE THE BROWSER',
      prompt: 'also private from analytics'
    }
  });

  assert.equal(event.app_key, 'paraphrasing');
  assert.equal(event.event_type, 'question_attempt');
  assert.equal(event.metadata.attempt_number, 2);
  assert.equal(event.metadata.outcome, 'correct');
  assert.equal('answer_text' in event.metadata, false);
  assert.equal('prompt' in event.metadata, false);
});

test('buildTrackingEvent validates active time and mode', () => {
  assert.throws(() => buildTrackingEvent({ event_type: 'active_time', active_seconds: 0 }));
  assert.throws(() => buildTrackingEvent({ event_type: 'app_open', mode: 'anything' }));

  const event = buildTrackingEvent({ event_type: 'active_time', active_seconds: 60 });
  assert.equal(event.active_seconds, 60);
});

test('active time counts only when visible and recently active', () => {
  const now = 1_000_000;
  assert.equal(shouldCountActiveTime({ visible: true, lastInteractionAt: now - 30_000, now }), true);
  assert.equal(shouldCountActiveTime({ visible: false, lastInteractionAt: now - 30_000, now }), false);
  assert.equal(shouldCountActiveTime({ visible: true, lastInteractionAt: now - 180_000, now }), false);
});
