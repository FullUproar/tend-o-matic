// Service-mode tells the till HOW the budtender wants to engage this
// customer. It is NOT a compliance field — the kernel never reads it.
// It exists on the cart so it travels with the budtender's intent
// through every UI surface, and so future surfaces (audit log,
// reporting, training-mode coaching) can read it back.
//
// The four modes correspond to the patterns documented in the
// 2026-05-14 Manus budtender brief (docs/sources/manus-budtender-
// 2026-05-14/research-brief.md): some customers want consultative
// service, some want speed, first-time customers need extra
// onboarding, and medical-sensitive interactions trigger
// responsible-guidance copy.

export type ServiceMode =
  | "EXPRESS"
  | "GUIDED"
  | "FIRST_TIME"
  | "MEDICAL_SENSITIVE";

export const DEFAULT_SERVICE_MODE: ServiceMode = "GUIDED";

export function serviceModeLabel(mode: ServiceMode): string {
  switch (mode) {
    case "EXPRESS":
      return "Express";
    case "GUIDED":
      return "Guided";
    case "FIRST_TIME":
      return "First-time";
    case "MEDICAL_SENSITIVE":
      return "Medical-sensitive";
  }
}

export function serviceModeDescription(mode: ServiceMode): string {
  switch (mode) {
    case "EXPRESS":
      return "Customer knows what they want. Keep the line moving.";
    case "GUIDED":
      return "Customer wants help choosing. Surface product detail and prompts.";
    case "FIRST_TIME":
      return "First-time buyer. Start-low / go-slow guidance + extra ID emphasis.";
    case "MEDICAL_SENSITIVE":
      return "Sensitive medical interaction. Avoid clinical claims; recommend professional consultation.";
  }
}
