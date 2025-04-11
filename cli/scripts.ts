import * as anchor from "@coral-xyz/anchor";
import { BN, Program, web3 } from "@coral-xyz/anchor";
import fs from "fs";

import { Keypair, Connection, PublicKey, SystemProgram, TransactionInstruction, SYSVAR_RENT_PUBKEY, ComputeBudgetProgram, Transaction, TransactionMessage, AddressLookupTableProgram, VersionedTransaction } from "@solana/web3.js";

import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";

import { Vault } from "../target/types/vault";

import { keypairIdentity, publicKey, transactionBuilder, TransactionBuilder, Umi } from '@metaplex-foundation/umi';
import { depositTx, initializeVaultTx, withdrawTx } from "../lib/scripts";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { web3JsRpc } from '@metaplex-foundation/umi-rpc-web3js';
import { TEST_DECIMALS, TEST_MAX_BALANCE, TEST_NAME, TEST_SYMBOL, TEST_URI } from "../lib/constant";
import { execTx } from "../lib/util";

let solConnection: Connection = null;
let program: Program<Vault> = null;
let payer: NodeWallet = null;
let provider: anchor.Provider = null;
let umi: Umi;

// Address of the deployed program.
let programId;

/**
 * Set cluster, provider, program
 * If rpc != null use rpc, otherwise use cluster param
 * @param cluster - cluster ex. mainnet-beta, devnet ...
 * @param keypair - wallet keypair
 * @param rpc - rpc
 */
export const setClusterConfig = async (
    cluster: web3.Cluster,
    keypair: string,
    rpc?: string
) => {
    if (!rpc) {
        solConnection = new web3.Connection(web3.clusterApiUrl(cluster));
    } else {
        solConnection = new web3.Connection(rpc);
    }

    const walletKeypair = Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(fs.readFileSync(keypair, "utf-8"))),
        { skipValidation: true }
    );
    payer = new NodeWallet(walletKeypair);

    console.log("Wallet Address: ", payer.publicKey.toBase58());

    anchor.setProvider(
        new anchor.AnchorProvider(solConnection, payer, {
            skipPreflight: true,
            commitment: "confirmed",
        })
    );

    provider = anchor.getProvider();
    const rpcUrl = rpc ? rpc : web3.clusterApiUrl(cluster);
    umi = createUmi(rpcUrl).use(web3JsRpc(provider.connection));

    // Generate the program client from IDL.
    program = anchor.workspace.Vault as Program<Vault>;
    programId = program.programId.toBase58();
    console.log("ProgramId: ", program.programId.toBase58());
};

export const initializeVault = async (depositMint: PublicKey,) => {
    const tx = await initializeVaultTx(
        depositMint,
        TEST_MAX_BALANCE,
        //  metadata
        TEST_NAME,
        TEST_SYMBOL,
        TEST_URI,
        TEST_DECIMALS,

        payer.publicKey,
        solConnection,
        program
    );

    await execTx(tx, solConnection, payer);
};

export const deposit = async (depositMint: PublicKey, amount: number) => {
    const tx = await depositTx(
        depositMint,
        amount,

        payer.publicKey,
        solConnection,
        program
    );
    await execTx(tx, solConnection, payer);
};

export const withdraw = async (depositMint: PublicKey, amount: number) => {
    const tx = await withdrawTx(
        depositMint,
        amount,

        payer.publicKey,
        solConnection,
        program
    );
    await execTx(tx, solConnection, payer);
};