/**
 * Fixtures for voice pipeline tests
 */

export const SAMPLE_AUDIO_BASE64 =
  "UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

export const SAMPLE_TRANSCRIPTION_RESPONSE = {
  results: [
    {
      alternatives: [
        {
          transcript: "Hello, this is a test transcription.",
          confidence: 0.97,
        },
      ],
      languageCode: "en-US",
    },
  ],
  totalBilledTime: { seconds: 5 },
};

export const SAMPLE_TTS_RESPONSE = {
  audioContent: Buffer.from("fake-audio-content"),
};

export const SUPPORTED_LANGUAGES = [
  "en-US",
  "es-ES",
  "zh-CN",
  "ja-JP",
  "ko-KR",
  "fr-FR",
  "de-DE",
  "pt-BR",
];

export const SAMPLE_USER = {
  id: "user-123",
  email: "test@example.com",
};
