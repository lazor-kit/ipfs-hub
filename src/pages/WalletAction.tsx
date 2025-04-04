import React, { useEffect, useState } from 'react';
import { Credential, getStoredCredentials, saveCredential } from '../utils/storage';
import { createPasskey, authenticateWithPasskey, signMessage } from '../utils/webauthn';

const WalletAction: React.FC = () => {
  const [status, setStatus] = useState<{ message: string; type: string }>({ message: '', type: '' });
  const [, setCredentials] = useState<Credential[]>([]);

  const displayStatus = (message: string, type: string) => setStatus({ message, type });

  useEffect(() => {
    const initWallet = async () => {
      if (!window.opener) {
        displayStatus("Error: No parent window found", "error");
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const action = urlParams.get("action");
      const message = urlParams.get("message");
      const storedCredentials = getStoredCredentials();

      setCredentials(storedCredentials);

      if (action === "connect") {
        if (storedCredentials.length > 0) {
          // Automatically connect with the first Passkey
          displayStatus("Connecting with the first Passkey...", "loading");
          await handleConnect();
        } else {
          displayStatus("No Passkey found. Creating new one...", "loading");
          try {
            const result = await createPasskey(displayStatus);
            saveCredential(result.credentialId, result.publickey);
            displayStatus("Passkey created successfully!", "success");
            window.opener.postMessage({ type: "WALLET_CONNECTED", data: result }, "*");
            setTimeout(() => window.close(), 2000);
          } catch (error) {
            console.error("Error creating Passkey:", error);
          }
        }
      } else if (action === "sign" && message) {
        if (storedCredentials.length === 0) {
          displayStatus("Error: No wallet connected", "error");
          window.opener.postMessage({ type: "SIGNATURE_ERROR", error: "No wallet connected" }, "*");
          setTimeout(() => window.close(), 2000);
          return;
        }
        // Automatically sign with the first Passkey
        displayStatus("Signing with the first Passkey...", "loading");
        await handleSign(storedCredentials[0]);
      } else {
        displayStatus("Error: Invalid action or missing message", "error");
        setTimeout(() => window.close(), 2000);
      }
    };

    initWallet();
  }, []);

  const handleConnect = async () => {
    const data = await authenticateWithPasskey(displayStatus);
    window.opener?.postMessage({ type: "WALLET_CONNECTED", data: data}, "*");
    setTimeout(() => window.close(), 2000);
  };

  const handleSign = async (cred: Credential) => {
    const message = new URLSearchParams(window.location.search).get("message") || '';
    const data = await signMessage(cred.credentialId, message, displayStatus);
    const normalized = data.normalized;
    const msg = data.msg;
    const publickey = data.publickey;
    window.opener?.postMessage({
      type: "SIGNATURE_CREATED",
      data: { normalized, msg , publickey },
    }, "*");
    setTimeout(() => window.close(), 2000);
  };

  return (
    <div className="container">
      <h1>Wallet Action</h1>
      <div id="status" className={status.type}>
        {status.message}
      </div>
    </div>
  );
};

export default WalletAction;