// src/services/payEntry.js
// Sends 1 KALE to the treasury using Freighter, then records the entry fee.

import {
  Server, Asset, TransactionBuilder, Operation, Networks
} from "@stellar/stellar-sdk";
import { setEntryPayment } from "../runEntry.js";

const server = new Server("https://horizon.stellar.org");

const TREASURY    = "GDIH6XE3UZ5CW37X3OKVS3SYKHG32PRPXPT3722NJ2AY3MOLCQNMUUTT";
const KALE_ISSUER = "GBDVX4VELCDSQ54KQJYTNHXAHFLBCA77ZY2USQBM4CSHTTV7DME7KALE";
const KALE = new Asset("KALE", KALE_ISSUER);

export async function payEntryWithFreighter(publicKey) {
  if (!window.freighterApi) throw new Error("Freighter not installed");

  // 1) Load account
  const account = await server.loadAccount(publicKey);

  // 2) Build tx: exactly 1 KALE, no memo, 5-min timeout
  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: Networks.PUBLIC
  })
    .addOperation(Operation.payment({
      destination: TREASURY,
      asset: KALE,
      amount: "1"
    }))
    .setTimeout(300) // use setTimeout OR timebounds (not both)
    .build();

  // 3) Sign in Freighter & submit
  const signedXDR = await window.freighterApi.signTransaction(
    tx.toXDR(), { network: "PUBLIC" }
  );
  const signedTx = TransactionBuilder.fromXDR(signedXDR, Networks.PUBLIC);
  const res = await server.submitTransaction(signedTx);

  // 4) Record entry in memory for this page session
  setEntryPayment({ txHash: res.hash, address: publicKey });

  return res.hash;
}
