export interface GoogleIdentityCredential {
  credential: string;
  nonce: string;
}

interface GoogleCredentialResponse {
  credential?: string;
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
            nonce?: string;
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
let identityNonce = "";
let credentialCallbacks: {
  onSuccess(identity: GoogleIdentityCredential): void;
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

async function createIdentityNonce() {
  const random = crypto.getRandomValues(new Uint8Array(32));
  const raw = window.btoa(String.fromCharCode(...random)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  const hashed = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return { raw, hashed };
}

export async function renderGoogleSignIn(
  element: HTMLElement,
  onSuccess: (identity: GoogleIdentityCredential) => void,
  onError: (error: Error) => void,
) {
  if (!GOOGLE_CLIENT_ID) throw new Error("Google sign-in is not configured for this site yet.");
  await loadGoogleIdentity();
  const identity = window.google?.accounts.id;
  if (!identity) throw new Error("Google sign-in could not be loaded.");
  credentialCallbacks = { onSuccess, onError };
  if (!identityInitialized) {
    const nonce = await createIdentityNonce();
    identityNonce = nonce.raw;
    identity.initialize({
      client_id: GOOGLE_CLIENT_ID,
      auto_select: false,
      nonce: nonce.hashed,
      callback: (response) => {
        const callbacks = credentialCallbacks;
        if (!callbacks) return;
        try {
          if (!response.credential) throw new Error("Google sign-in was cancelled.");
          if (!identityNonce) throw new Error("Google sign-in could not establish a secure nonce.");
          callbacks.onSuccess({ credential: response.credential, nonce: identityNonce });
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
