export const CHESS_LEVEL_IDS = {
  beginner:  '0e7c5b2e-2e3f-4b8a-9f1c-2b8e4f2e4f2e',
  amateur:   '1a9f8c3d-3a4b-5c7d-8e9f-3c7f8e3e7f3e',
  master:    'a1b2c3d4-e5f6-7890-abcd-123456789012',
  grandmaster:'b2c3d4e5-f6a7-8901-bcde-234567890123',
} as const;

export type ChessLevelName = keyof typeof CHESS_LEVEL_IDS;