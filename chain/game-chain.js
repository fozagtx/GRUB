// chain/game-chain.js
import { Server } from "stellar-sdk/rpc";
import { Client } from "stellar-sdk/contract";
import { Networks } from "stellar-sdk";

const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;

// TODO: put real values after you deploy/init the contract
const GATE_CONTRACT_ID = "CONTRACT_ID_FROM_DEPLOY";
const KALE_TOKEN_CONTRACT_ID = "KALE_TOKEN_CONTRACT_ID";
const TREASURY_ADDRESS = "G...YOUR_TREASURY...";

const server = new Server(RPC_URL);

export async function connectFreighter() {
  if (!window.freighter) {
    alert("Install Freighter from https://www.freighter.app and switch to Testnet.");
    throw new Error("Freighter not installed");
  }
  return await window.freighter.getUserPublicKey();
}

export async function payOneKaleAndSubmit(score, playerAddress) {
  const gate = new Client({ server, networkPassphrase: NETWORK_PASSPHRASE })
                 .forContract(GATE_CONTRACT_ID);

  // simulate → prepare → sign → send
  const prepared = await gate.invoke("enter", Number(score)).prepare({ address: playerAddress });

  const signedXDR = await window.freighter.signTransaction(prepared.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  return await server.sendTransaction(signedXDR);
}
