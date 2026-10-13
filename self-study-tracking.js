import { buildTrackingEvent, shouldCountActiveTime } from './tracking-core.js';

const SUPABASE_URL = 'https://grjshlamooglytsajoun.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_cEnd4qO-aDZo0JJLgvmmhA_y_VxWzfJ';
const FLUSH_SECONDS = 60;
const TICK_SECONDS = 30;

let client = null;
let ready = false;
let enabled = false;
let queued = [];
let lastInteractionAt = Date.now();
let activeSeconds = 0;
let timer = null;

async function sendEvent(payload) {
  if (!enabled || !client) return;
  let event;
  try {
    event = buildTrackingEvent(payload);
  } catch (error) {
    console.warn('Self-Study tracking event rejected:', error);
    return;
  }

  try {
    const { error } = await client.from('activity_events').insert(event);
    if (error) console.warn('Self-Study tracking write failed:', error.message || error);
  } catch (error) {
    console.warn('Self-Study tracking unavailable:', error);
  }
}

function track(payload) {
  if (!ready) {
    queued.push(payload);
    return;
  }
  if (!enabled) return;
  void sendEvent(payload);
}

function markInteraction() {
  lastInteractionAt = Date.now();
}

function flushActiveTime() {
  if (!enabled || activeSeconds <= 0) return;
  const seconds = Math.min(600, activeSeconds);
  activeSeconds = 0;
  track({
    event_type: 'active_time',
    active_seconds: seconds,
    mode: typeof window.getMode === 'function' ? window.getMode() : undefined
  });
}

function startActiveTimer() {
  if (timer) return;
  timer = window.setInterval(() => {
    if (shouldCountActiveTime({
      visible: document.visibilityState === 'visible',
      lastInteractionAt,
      now: Date.now()
    })) {
      activeSeconds += TICK_SECONDS;
      if (activeSeconds >= FLUSH_SECONDS) flushActiveTime();
    }
  }, TICK_SECONDS * 1000);

  ['pointerdown', 'keydown', 'input', 'touchstart'].forEach(type => {
    document.addEventListener(type, markInteraction, { passive: true });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') markInteraction();
    else flushActiveTime();
  });
  window.addEventListener('pagehide', flushActiveTime);
}

async function initialise() {
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.3/+esm');
    client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData?.user) {
      ready = true;
      queued = [];
      return;
    }

    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('id, active')
      .eq('id', userData.user.id)
      .single();

    if (profileError || !profile?.active) {
      ready = true;
      queued = [];
      return;
    }

    enabled = true;
    ready = true;
    const pending = queued;
    queued = [];
    pending.forEach(item => track(item));

    track({
      event_type: 'app_open',
      mode: typeof window.getMode === 'function' ? window.getMode() : undefined
    });
    startActiveTimer();
  } catch (error) {
    ready = true;
    queued = [];
    console.warn('Self-Study tracking could not initialise:', error);
  }
}

window.SelfStudyTracking = {
  track,
  isEnabled: () => enabled
};

void initialise();
