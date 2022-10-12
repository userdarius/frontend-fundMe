import { ethers } from "./ethers-5.6.em.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");

fundButton.onclick = fund;
connectButton.onclick = connect;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

async function connect() {
    if (typeof window.ethereum !== undefined) {
        console.log("Metamask is available... connecting");
        window.ethereum.request({ method: "eth_requestAccounts" });
        connectButton.innerHTML = "Connected!";
    } else {
        connectButton.innerHTML = "Not connected!";
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value;
    console.log(`Funding with ${ethAmount} ETH...`);
    if (typeof window.ethereum !== undefined) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const contract = new ethers.Contract(contractAddress, abi, signer);

        try {
            const transaction = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            });
            await listenForTransaction(transaction, provider);
            console.log(`Funded with ${ethAmount} ETH`);
        } catch (err) {
            console.log(err);
        }
    }
}

async function getBalance() {
    if (typeof window.ethereum !== undefined) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(contractAddress);
        console.log(ethers.utils.formatEther(balance));
    }
}

async function withdraw() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
        const transaction = await contract.cheaperWithdraw();
        await listenForTransaction(transaction, provider);
        console.log(`Withdrew`);
    } catch (err) {
        console.log(err);
    }
}

function listenForTransaction(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`);
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Mined ${transactionReceipt.confirmations} confirmations`
            );
            resolve();
        });
    });
}
