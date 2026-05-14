import type { MetrcOperation } from "./operation";

// MetrcClient is the typed surface the application talks to. v0.1 ships
// only the interface and a `NotImplementedClient` that throws on every
// call — there are no METRC sandbox credentials yet, so any real
// implementation would be guessing at the wire format.
export interface MetrcClient {
  send<TPayload, TResponse>(
    op: MetrcOperation,
    payload: TPayload,
    opts: { idempotencyKey: string; signal?: AbortSignal },
  ): Promise<TResponse>;
}

export class MetrcCredentialsRequired extends Error {
  constructor() {
    super(
      "MetrcClient: sandbox or production credentials not configured. See docs/compliance-dossier.md for the credential acquisition path.",
    );
    this.name = "MetrcCredentialsRequired";
  }
}

export class NotImplementedMetrcClient implements MetrcClient {
  async send<TPayload, TResponse>(
    _op: MetrcOperation,
    _payload: TPayload,
    _opts: { idempotencyKey: string; signal?: AbortSignal },
  ): Promise<TResponse> {
    throw new MetrcCredentialsRequired();
  }
}
