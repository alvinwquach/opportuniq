'use client';

import * as amplitude from '@amplitude/analytics-browser';
import { sessionReplayPlugin } from '@amplitude/plugin-session-replay-browser';

function initAmplitude() {
  if (typeof window !== 'undefined') {
    amplitude.add(sessionReplayPlugin());
    amplitude.init(process.env.NEXT_PUBLIC_AMPLITUDE_KEY || '', {"autocapture":true});
  }
}

initAmplitude();

export const Amplitude = () => null;
export default amplitude;