"use client"
import { useWeb3Auth } from 'use-cardano-web3-auth';

export function Web3Login() {

    const { login: web3AuthLogin } = useWeb3Auth();

    const handleLogin = () => {
        web3AuthLogin("google");
    }

    return (
        <button onClick={handleLogin}>Login with Google</button>
    );
}