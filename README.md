# Passkey Sharing Hub

A decentralized, client-side hub enabling dApps and websites to share and manage WebAuthn passkeys via a single HTML file hosted on IPFS.

## Overview

This project provides a **Passkey Sharing Hub**, a lightweight interface that allows decentralized applications (dApps) and websites to share a single WebAuthn passkey for authentication and message signing. Unlike traditional solutions, this hub operates **without a server backend**, running entirely in the browser as a static HTML file hosted on IPFS. It eliminates central points of failure and bottlenecks, ensuring a fully decentralized experience.

### Key Features
- **Passkey Sharing**: A single passkey stored locally can be reused across multiple dApps and websites.
- **No Server**: All logic is client-side, handled by a single HTML file.
- **IPFS Hosting**: Hosted on IPFS for global, decentralized access.
- **WebAuthn**: Uses resident keys for secure, device-bound passkey management.

### How It Solves the Problem
- **Cross-Website Access**: dApps/websites call this hub (via popup) to create, authenticate, or sign with a shared passkey.
- **Decentralized**: No central server or database—passkeys are stored in the user's browser (`localStorage`).
- **No Bottleneck**: IPFS ensures availability without reliance on a single point of control.

## How It Works

### Core Concept
The hub acts as an intermediary interface:
1. A dApp/website opens the hub in a popup with specific URL parameters (`action=connect` or `sign`).
2. The hub manages passkeys using WebAuthn and returns results (public key, signature) to the caller via `postMessage`.
3. Passkeys are stored locally in `localStorage` and shared across all sites that call the hub.

### Code Breakdown

#### HTML & CSS
- **Structure**: A simple UI with a title ("Wallet Action"), passkey list, status area, and a "Create New Passkey" button.
- **Styling**: Minimal CSS for a clean look (colors, shadows, animations).

#### JavaScript Modules

1. **Utils**:
   - `arrayBufferToBase64Url`: Converts ArrayBuffer to base64 URL-safe string.
   - `base64UrlToArrayBuffer`: Reverses the process.
   - `generateRandomChallenge`: Generates a random 32-byte challenge for WebAuthn.

2. **Storage**:
   - `getCredentials`: Retrieves the stored passkey from `localStorage` (currently supports one passkey).
   - `saveCredential`: Saves `credentialId` and `publicKey` locally.

3. **UI**:
   - `displayStatus`: Updates the status area with messages (e.g., "Passkey created successfully!").
   - `renderPasskeyOptions`: Displays a clickable list of passkeys (currently one).

4. **WebAuthn**:
   - `createPasskey`:
     - Creates a new passkey using `navigator.credentials.create`.
     - Uses `residentKey: "required"` to store it on the device.
     - Compresses the public key and saves it with `credentialId`.
     - Returns: `{ credentialId, publicKey, status }`.
   - `authenticate`:
     - Authenticates using the stored `credentialId` with `navigator.credentials.get`.
   - `signMessage`:
     - Signs a message with the passkey, returning the signature.

5. **WalletController**:
   - `sendMessage`: Sends results to the parent window via `postMessage` and closes the popup.
   - `handleConnect`: Creates a new passkey if none exist, or authenticates an existing one.
   - `handleSign`: Signs a message with the selected passkey.
   - `initialize`: Reads URL params (`action`, `message`) and sets up the flow.

### Passkey Sharing Mechanism
- **Creation**: A dApp calls the hub with `?action=connect` to create a passkey if none exists.
- **Reuse**: Subsequent calls from any dApp/website can authenticate or sign with the stored passkey.
- **Storage**: Passkey metadata (`credentialId`, `publicKey`) is kept in `localStorage`, accessible across domains that load the hub.

### Decentralized Design
- **No Backend**: Logic runs entirely in the browser, with WebAuthn handling cryptographic operations.
- **IPFS**: Hosting on IPFS ensures the hub is a static, globally accessible resource.
