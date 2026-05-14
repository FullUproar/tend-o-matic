// Device binding for till and manager-phone registration. Each till
// holds a long-lived device credential (private key on the device,
// public key in the DB device row). Sessions on that till are bound
// to the device_id; rotating or revoking the device kills all sessions.
export type DeviceRegistration = {
  deviceId: string;
  tenantId: string;
  locationId: string;
  kind: "TILL" | "MANAGER_PHONE" | "KIOSK";
  publicKey: string;
  registeredAt: string;
};

export type DeviceChallenge = {
  deviceId: string;
  nonce: string;
  expiresAt: string;
};

export type DeviceSignature = {
  deviceId: string;
  nonce: string;
  // Base64 signature of the nonce produced by the device's private key.
  signature: string;
};
