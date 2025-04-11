import { program } from "commander";
import { PublicKey } from "@solana/web3.js";
import {
    deposit,
    initializeVault,
    setClusterConfig,
    withdraw,
} from "./scripts";

program.version("0.0.1");

programCommand("init")
    .option("-t, --token <string>", "token address")
    .action(async (directory, cmd) => {
        const { env, keypair, rpc, token } = cmd.opts();

        console.log("Solana Cluster:", env);
        console.log("Keypair Path:", keypair);
        console.log("RPC URL:", rpc);

        await setClusterConfig(env, keypair, rpc);

        if (token === undefined) {
            console.log("Error token address");
            return;
        }

        await initializeVault(new PublicKey(token));
    });

programCommand("deposit")
    .option("-t, --token <string>", "token address")
    .option("-a, --amount <number>", "swap amount")
    .action(async (directory, cmd) => {
        const { env, keypair, rpc, token, amount } = cmd.opts();

        console.log("Solana Cluster:", env);
        console.log("Keypair Path:", keypair);
        console.log("RPC URL:", rpc);

        await setClusterConfig(env, keypair, rpc);

        if (token === undefined) {
            console.log("Error token address");
            return;
        }

        await deposit(new PublicKey(token), amount);
    });


programCommand("withdraw")
    .option("-t, --token <string>", "token address")
    .option("-a, --amount <number>", "swap amount")
    .action(async (directory, cmd) => {
        const { env, keypair, rpc, token, amount } = cmd.opts();

        console.log("Solana Cluster:", env);
        console.log("Keypair Path:", keypair);
        console.log("RPC URL:", rpc);

        await setClusterConfig(env, keypair, rpc);

        if (token === undefined) {
            console.log("Error token address");
            return;
        }

        await withdraw(new PublicKey(token), amount);
    });




function programCommand(name: string) {
    return program
        .command(name)
        .option(
            //  mainnet-beta, testnet, devnet
            "-e, --env <string>",
            "Solana cluster env name",
            "devnet"
        )
        .option(
            "-r, --rpc <string>",
            "Solana cluster RPC name",
            "https://api.devnet.solana.com"
        )
        .option(
            "-k, --keypair <string>",
            "Solana wallet Keypair Path",
            "./keypair.json"
        );
}

program.parse(process.argv);