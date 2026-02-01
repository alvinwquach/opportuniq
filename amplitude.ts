'use client';

import * as amplitude from '@amplitude/analytics-browser';
import { sessionReplayPlugin } from '@amplitude/plugin-session-replay-browser';

function initAmplitude() {
  if (typeof window !== 'undefined') {
    amplitude.add(sessionReplayPlugin());
    amplitude.init('c3bb018cd2c22034ccffbb856db37f9b', {"autocapture":true});
  }
}

initAmplitude();

export const Amplitude = () => null;
export default amplitude;