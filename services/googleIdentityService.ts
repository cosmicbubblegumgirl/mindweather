export interface GoogleIdentityProfile {
  id: string;
  name: string;
  email: string;
}

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleIdClaims {
  aud?: string;
  email?: string;
  email_verified?: boolean;
  exp?: number;
  iss?: string;
  name?: string;
  sub?: string;
}

interface GoogleTokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

interface GoogleTokenClient {
  requestAccessToken(options?: { prompt?: string }): void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          disableAutoSelect(): void;
          initialize(options: {
            auto_select?: boolean;
            callback(response: GoogleCredentialResponse): void;
            client_id: string;
            use_fedcm_for_prompt?: boolean;
          }): void;
          renderButton(element: HTMLElement, options: {
            logo_alignment?: "left" | "center";
            shape?: "rectangular" | "pill" | "circle" | "square";
            size?: "small" | "medium" | "large";
            text?: "signin_with" | "signup_with" | "continue_with" | "signin";
            theme?: "outline" | "filled_blue" | "filled_black";
            type?: "standard" | "icon";
            width?: number;
          }): void;
        };
        oauth2: {
          initTokenClient(options: {
            callback(response: GoogleTokenResponse): void;
            client_id: string;
            error_callback?(error: { type?: string }): void;
            scope: string;
          }): GoogleTokenClient;
          revoke(token: string, callback?: () => void): void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
let identityInitialized = false;
let credentialCallbacks: {
  onSuccess(profile: GoogleIdentityProfile): void;
  onError(error: Error): void;
} | undefined;

export function googleIdentityConfigured() {
  return Boolean(GOOGLE_CLIENT_ID);
}

export function loadGoogleIdentity() {
  if (window.google?.accounts) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-mindweather-google]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Google sign-in could not be loaded.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.mindweatherGoogle = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google sign-in could not be loaded."));
    document.head.appendChild(script);
  });
}

function decodeCredential(credential: string): GoogleIdClaims {
  const encoded = credential.split(".")[1];
  if (!encoded) throw new Error("Google did not return a valid identity credential.");
  const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const bytes = Uint8Array.from(window.atob(padded), (character) => character.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes)) as GoogleIdClaims;
}

function identityProfile(credential: string): GoogleIdentityProfile {
  const claims = decodeCredential(credential);
  const validIssuer = claims.iss === "https://accounts.google.com" || claims.iss === "accounts.google.com";
  if (claims.aud !== GOOGLE_CLIENT_ID || !validIssuer || !claims.exp || claims.exp * 1000 <= Date.now()) {
    throw new Error("Google returned an identity credential for a different app or an expired session.");
  }
  if (!claims.sub || !claims.email || claims.email_verified !== true) {
    throw new Error("Google could not confirm a verified email address for this account.");
  }
  return {
    id: claims.sub,
    name: claims.name?.trim() || claims.email.split("@")[0],
    email: claims.email.toLowerCase(),
  };
}

export async function renderGoogleSignIn(
  element: HTMLElement,
  onSuccess: (profile: GoogleIdentityProfile) => void,
  onError: (error: Error) => void,
) {
  if (!GOOGLE_CLIENT_ID) throw new Error("Google sign-in is not configured for this site yet.");
  await loadGoogleIdentity();
  const identity = window.google?.accounts.id;
  if (!identity) throw new Error("Google sign-in could not be loaded.");
  credentialCallbacks = { onSuccess, onError };
  if (!identityInitialized) {
    identity.initialize({
      client_id: GOOGLE_CLIENT_ID,
      auto_select: false,
      callback: (response) => {
        const callbacks = credentialCallbacks;
        if (!callbacks) return;
        try {
          if (!response.credential) throw new Error("Google sign-in was cancelled.");
          callbacks.onSuccess(identityProfile(response.credential));
        } catch (error) {
          callbacks.onError(error instanceof Error ? error : new Error("Google sign-in could not be completed."));
        }
      },
    });
    identityInitialized = true;
  }
  element.replaceChildren();
  identity.renderButton(element, {
    type: "standard",
    theme: "outline",
    size: "large",
    text: "continue_with",
    shape: "rectangular",
    logo_alignment: "left",
    width: Math.min(360, Math.max(240, element.clientWidth || 320)),
  });
}

export function disableGoogleAutoSelect() {
  window.google?.accounts.id.disableAutoSelect();
}
