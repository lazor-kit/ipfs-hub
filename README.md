# Passkey Sharing Hub

A decentralized, client-side hub enabling dApps and websites to share and manage WebAuthn passkeys via a single HTML file hosted on IPFS.

## 📋 Overview

This project provides a Passkey Sharing Hub, a lightweight interface that allows decentralized applications (dApps) and websites to share a single WebAuthn passkey for authentication and message signing. Unlike traditional solutions, this hub operates without a server backend, running entirely in the browser as a static HTML file hosted on IPFS. It eliminates central points of failure and bottlenecks, ensuring a fully decentralized experience.

## 🚀 Key Features

- **Passkey Sharing**: A single passkey stored locally can be reused across multiple dApps and websites
- **No Server**: All logic is client-side, handled by a single HTML file
- **IPFS Hosting**: Hosted on IPFS for global, decentralized access
- **WebAuthn**: Uses resident keys for secure, device-bound passkey management

## 🔍 How It Works

### Core Concept

The hub acts as an intermediary interface:
- A dApp/website opens the hub in a popup with specific URL parameters (`action=connect` or `sign`)
- The hub manages passkeys using WebAuthn and returns results (public key, signature) to the caller via `postMessage`
- Passkeys are stored locally in `localStorage` and shared across all sites that call the hub

### Key Components

- **Utils**: Handles data conversion and challenge generation
- **Storage**: Manages passkey storage in localStorage
- **WebAuthn**: Handles passkey creation, authentication, and message signing
- **WalletController**: Coordinates the flow between dApps and the hub

## 📦 Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd ipfs_hub
```

2. Install dependencies using pnpm:
```bash
pnpm install
```

## 🚀 Development

To start the development server:

```bash
pnpm dev
```

This will start the Vite development server at `http://localhost:5173`

## 📦 Building for Production

To create a production build:

```bash
pnpm build
```

The build artifacts will be stored in the `dist/` directory.

## 🧪 Testing

To run the linter:

```bash
pnpm lint
```

## 🚀 Deploy to IPFS

To deploy the hub to IPFS, use Web3.Storage login and run this command:
```bash
w3 up dist/
```

## 📁 Project Structure

```
ipfs_hub/
├── src/
│   ├── assets/      # Static assets
│   ├── pages/       # Page components
│   ├── utils/       # Utility functions
│   ├── App.tsx      # Main application component
│   ├── main.tsx     # Application entry point
│   └── index.css    # Global styles
├── public/          # Public assets
├── dist/            # Production build
```

## 🔧 Configuration

- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint configuration

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
