# Header ignition sequence - local proof

Date: 2026-10-20
Preview: http://127.0.0.1:3001/?revision=header-ignition-final

Latest user request:
- Place the warning icons in the marked central header area.
- Make every icon red, including the formerly yellow engine.
- Reveal left to right on recording beep attacks. Earlier icons remain lit; finish with all five visible.
- Use only the first ten seconds of the supplied SFX.

Delivered:
- One centered five-slot header row, with no remaining chapter-body icons.
- Transparent source icons rendered as alpha masks in #e51b23, preserving open symbol interiors.
- Exact 10.000 s stereo 48 kHz PCM WAV from the user-provided MP3 at public/audio/ignition-first-10s.wav.
- Recording currentTime drives cumulative reveals at 2.70, 3.91, 5.11, 6.31, 7.50 s.
- Signal-derived cues use repeated ~796.9 Hz envelope attacks. Peaks follow around 40 ms later.
- Source filename, trim data, cue estimates and analysis limitations: output/audio/ignition-cues.json. Detailed FFT/RMS analysis remains a local working artifact.
- Mouse movement/touch begins the silent visual sequence. Explicit sound enable restarts the recording and lights together. Muting while playing preserves the media clock.
- Fixed desktop and sticky phone header keep the row visible during scrolling. The request page's header remains unchanged.
- All five lights remain lit after ten seconds; no blinking or idle fade.
- The earlier Back to your day sound cutoff remains. Audio pauses at that boundary while any remaining visual reveals finish silently; the sound control becomes disabled and says Quiet ending.
- Existing wrench cursor preserved. Synthetic engine helper removed.

Checks:
- Production build, strict typecheck and scoped ESLint passed.
- 34 browser tests passed: 17 landing/navigation regressions, 11 public reflow/integration checks, and 6 updated sequence tests.
- Tested cue order, cumulative persistence, exact red CSS color, actual media playhead synchronization, ten-second media duration, mute/unmute clock preservation, audio failure fallback, quiet ending, unloading on navigation, mobile touch, reduced motion and cursor.
- Nine responsive viewport sizes include narrow phones and short landscape; enlarged-text and keyboard checks passed.
- Independent source and desktop/mobile screenshot review found no material UI or code issues.
- Captures: output/playwright/header-ignition/desktop-first.png, desktop-all.png, mobile-all.png.

Limits:
Local production build only; not deployed. Beep timing was estimated from spectral/envelope analysis with roughly 40 ms onset tolerance. Subjective synchronization and playback volume remain for user review. The original Downloads MP3 was preserved; temporary full-source public copy was removed.
