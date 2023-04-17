
import { Connection, Keypair } from "https://esm.sh/@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, setAuthority, transfer } from "https://esm.sh/@solana/spl-token";


const connection = new Connection("https://api.devnet.solana.com", "confirmed");

const secret = [13,26,129,10,250,216,150,138,165,48,84,172,158,89,93,224,111,155,45,197,162,44,66,217,90,96,20,211,24,69,163,176,62,132,29,205,50,125,93,198,160,152,249,146,223,245,228,214,172,83,9,191,129,20,18,151,207,58,71,227,24,252,201,60];
const fromWallet = Keypair.fromSecretKey(new Uint8Array(secret));

(async () => {
  // Create a new token 
  const mint = await createMint(
    connection, 
    fromWallet,            // Payer of the transaction
    fromWallet.publicKey,  // Account that will control the minting 
    null,                  // Account that will control the freezing of the token 
    0                      // Location of the decimal place 
  );

  // Get the token account of the fromWallet Solana address. If it does not exist, create it.
  const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    fromWallet,
    mint,
    fromWallet.publicKey
  );

  // Generate a new wallet to receive the newly minted token
  const toWallet = Keypair.generate();

  // Get the token account of the toWallet Solana address. If it does not exist, create it.
  const toTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    fromWallet,
    mint,
    toWallet.publicKey
  );

  // Minting 1 new token to the "fromTokenAccount" account we just returned/created.
  let signature = await mintTo(
    connection,
    fromWallet,               // Payer of the transaction fees 
    mint,                     // Mint for the account 
    fromTokenAccount.address, // Address of the account to mint to 
    fromWallet.publicKey,     // Minting authority
    1                         // Amount to mint 
  );

  await setAuthority(
    connection,
    fromWallet,            // Payer of the transaction fees
    mint,                  // Account 
    fromWallet.publicKey,  // Current authority 
    0,                     // Authority type: "0" represents Mint Tokens 
    null                   // Setting the new Authority to null
  );

  signature = await transfer(
    connection,
    fromWallet,               // Payer of the transaction fees 
    fromTokenAccount.address, // Source account 
    toTokenAccount.address,   // Destination account 
    fromWallet.publicKey,     // Owner of the source account 
    1                         // Number of tokens to transfer 
  );

  console.log("SIGNATURE", signature);

})();



