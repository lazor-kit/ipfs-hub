import { Buffer } from 'buffer';
import { generateRandomChallenge , SECP256R1_SPKI_HEADER} from './utils';
import { secp256r1 } from '@noble/curves/p256';
import { sha256 } from '@noble/hashes/sha256';

export interface WalletResult {
  credentialId: string;
  publickey: string;
  status: 'created' | 'existing';
}

export async function createPasskey(displayStatus: (message: string, type: string) => void): Promise<WalletResult> {
  try {
    const userData = generateRandomChallenge();
    const userName = `user_${Date.now()}`;

    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge: new Uint8Array([117, 61, 252, 231, 191, 241]),
        rp: { name: "test" },
        user: { id: userData, name: userName, displayName: userName },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          residentKey: "required",
          requireResidentKey: true,
        },
      },
    })) as PublicKeyCredential;

    if (!credential) throw new Error("No credential returned");

    const response = credential.response as AuthenticatorAttestationResponse;
    const pubkeyBuffer = response.getPublicKey();
    if (!pubkeyBuffer) throw new Error("No public key returned");
    const publicKey = new Uint8Array(pubkeyBuffer);
    const pubkeyUncompressed = publicKey.slice(SECP256R1_SPKI_HEADER.length);
    const pubkey = secp256r1.ProjectivePoint.fromHex(pubkeyUncompressed);
    const compressedKey = Buffer.from(pubkey.toRawBytes(true)).toString("base64");


    const credentialId = Buffer.from(credential.rawId).toString("base64");
   
    displayStatus("Passkey created successfully!", "success");
    return { credentialId, publickey: compressedKey, status: "created" };
  } catch (error) {
    displayStatus(`Error creating passkey: ${(error as Error).message}`, "error");
    throw error;
  }
}

export async function authenticateWithPasskey(
  displayStatus: (message: string, type: string) => void
): Promise<{ publickey: string; credentialId: string }> {
  try {

    const credentialId = localStorage.getItem("CREDENTIAL_ID");
    const publickey = localStorage.getItem("PUBLIC_KEY");

    if (!credentialId || !publickey) {
      throw new Error("Credential ID or Public Key not found in localStorage");
    }

    displayStatus("Wallet connected successfully!", "success");

    return { publickey, credentialId };

  } catch (error) {
    displayStatus(`Error: ${(error as Error).message}`, "error");
    throw error;
  }
}

export async function signMessage(
  credentialId: string,
  message: string,
  displayStatus: (message: string, type: string) => void
): Promise<{ normalized: string; msg: string , publickey: string }> {
  try {
    const challenge = Buffer.from(message, "base64");
    const credential = (await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [{ type: "public-key", id: new Uint8Array(Buffer.from(credentialId, "base64")) }],
      },
    })) as PublicKeyCredential;

    if (!credential) throw new Error("No credential returned");

    const assertionResponse = credential.response as AuthenticatorAssertionResponse;
    const sig = secp256r1.Signature.fromDER(new Uint8Array(assertionResponse.signature))
    const authenticatorData = new Uint8Array(assertionResponse.authenticatorData);
    const clientDataJSON = new Uint8Array(assertionResponse.clientDataJSON);
    const clientDataJSONDigest = sha256(clientDataJSON);
    const msg = Buffer.from(new Uint8Array([...authenticatorData, ...clientDataJSONDigest])).toString("base64");

    const normalized = Buffer.from(sig.normalizeS().toCompactRawBytes()).toString("base64");
    const publickey = localStorage.getItem("PUBLIC_KEY");
    if (!publickey) {
      throw new Error("Public Key not found in localStorage");
    }
    displayStatus("Message signed successfully!", "success");
    return { normalized, msg, publickey };

  } catch (error) {
    displayStatus(`Signing failed: ${(error as Error).message}`, "error");
    throw error;
  }
}