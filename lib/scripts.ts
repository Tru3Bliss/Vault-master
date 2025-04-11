import { BN, Program } from "@coral-xyz/anchor";
import {
    ComputeBudgetProgram,
    Connection,
    Keypair,
    PublicKey,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
    Transaction,
} from "@solana/web3.js";

import { Vault } from "../target/types/vault";

// import {
//     SEED_BONDING_CURVE,
//     SEED_CONFIG,
// } from "./constant";

import {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    NATIVE_MINT,
    TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { METADATA_SEED, SEED_LP_MINT, SEED_VAULT, TOKEN_METADATA_PROGRAM_ID } from "./constant";
import { getAssociatedTokenAccount } from "./util";
import { publicKey } from "@project-serum/anchor/dist/cjs/utils";

export const initializeVaultTx = async (

    depositMint: PublicKey,

    maxBalance: number,

    name: string,
    symbol: string,
    uri: string,
    decimals: number,

    admin: PublicKey,

    connection: Connection,
    program: Program<Vault>
) => {
    const lpMint = PublicKey.findProgramAddressSync([Buffer.from(SEED_LP_MINT), depositMint.toBytes()], program.programId)[0];
    const metadata = PublicKey.findProgramAddressSync(
        [
            Buffer.from(METADATA_SEED),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            lpMint.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
    )[0];
    const vaultInfo = PublicKey.findProgramAddressSync([Buffer.from(SEED_VAULT), depositMint.toBytes()], program.programId)[0];
    console.log("vaultInfo", vaultInfo);

    const depositVaultTokenAccount = getAssociatedTokenAccount(vaultInfo, depositMint);

    const tx = await program.methods
        .initializeVault(new BN(maxBalance), { name, symbol, uri, decimals })
        .accounts({
            metadata,
            vaultInfo,
            depositMint,
            depositVaultTokenAccount,
            payer: admin,
            lpMint,
            rent: SYSVAR_RENT_PUBKEY,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        })
        .transaction();


    tx.feePayer = admin;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    return tx;
};

export const depositTx = async (
    depositMint: PublicKey,
    amount: number,

    user: PublicKey,
    connection: Connection,
    program: Program<Vault>) => {
    const vaultInfo = PublicKey.findProgramAddressSync([Buffer.from(SEED_VAULT), depositMint.toBytes()], program.programId)[0];
    const depositVaultTokenAccount = getAssociatedTokenAccount(vaultInfo, depositMint);
    const depositUserTokenAccount = getAssociatedTokenAccount(user, depositMint);
    const lpMint = PublicKey.findProgramAddressSync([Buffer.from(SEED_LP_MINT), depositMint.toBytes()], program.programId)[0];
    const userLpTokenAccount = getAssociatedTokenAccount(user, lpMint);

    const tx = await program.methods
        .deposit(new BN(amount))
        .accounts(
            {
                vaultInfo,
                depositMint,
                depositVaultTokenAccount,
                depositUserTokenAccount,
                lpMint,
                userLpTokenAccount,
                payer: user,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            }
        ).transaction();

    tx.feePayer = user;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    return tx;
}

export const withdrawTx = async (depositMint: PublicKey,
    amount: number,

    user: PublicKey,
    connection: Connection,
    program: Program<Vault>) => {
    const vaultInfo = PublicKey.findProgramAddressSync([Buffer.from(SEED_VAULT), depositMint.toBytes()], program.programId)[0];
    const depositVaultTokenAccount = getAssociatedTokenAccount(vaultInfo, depositMint);
    const depositUserTokenAccount = getAssociatedTokenAccount(user, depositMint);
    const lpMint = PublicKey.findProgramAddressSync([Buffer.from(SEED_LP_MINT), depositMint.toBytes()], program.programId)[0];
    const userLpTokenAccount = getAssociatedTokenAccount(user, lpMint);

    const tx = await program.methods
        .withdraw(new BN(amount))
        .accounts(
            {
                vaultInfo,
                depositMint,
                depositVaultTokenAccount,
                depositUserTokenAccount,
                lpMint,
                userLpTokenAccount,
                payer: user,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
            }
        ).transaction();

    tx.feePayer = user;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    return tx;
}