import {createWalletClient, custom, createPublicClient, parseEther, defineChain, formatEther} from "https://esm.sh/viem"
import { contractAddress, HimaAbi } from "./constants.js"


const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const ethAmountInput = document.getElementById("ethAmount")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
const checkFundingButton = document.getElementById("checkFundingButton")

let walletClient
let publicClient

async function getCurrentChain(client) {
  const chainId = await client.getChainId()
  const currentChain = defineChain({
    id: chainId,
    name: "Custom Chain",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ["http://localhost:8545"],
      },
    },
  })
  return currentChain
}

async function connect () {
  try {
  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient ({
  transport: custom(window.ethereum)
})
const accounts = await walletClient.requestAddresses(); 
console.log("Connected accounts:", accounts)
connectButton.innerHTML = "Connected"

  } else {
    connectButton.innerHTML("Please install metamask")
  }
} catch (error) {
  console.error ("Connection error:", error)
  connectButton.innerHTML = "Connection failed"

  }
}
  async function fund () {
    const ethAmount = ethAmountInput.value
    console.log(`Funding with ${ethAmount}...`)

      if(typeof window.ethereum !== "undefined") {
        walletClient = createWalletClient ({
      transport: custom(window.ethereum)
    });

    const [connectedAccount] = await walletClient.requestAddresses();
    const currentChain = await getCurrentChain(walletClient);

    publicClient = createPublicClient ({
      transport: custom(window.ethereum)
    });
    const {request} = await publicClient.simulateContract ({
      address: contractAddress,
      abi: HimaAbi,
      chain: currentChain,
      functionName: "fund",
      account: connectedAccount,
      value: parseEther(ethAmount),
    });
    
    // TRANSACTION HASH
    const hash = await walletClient.writeContract(request)
    console.log(hash)

    } else {
      connectButton.innerHTML = "Please install metamask"
    }
  }

  async function getBalance() {
    if (typeof window.ethereum !== "undefined")
      walletClient = createWalletClient ({
    transport: custom(window.ethereum)
  });
  const balance = await publicClient.getBalance ({
    address: contractAddress
  });
  console.log(formatEther(balance))
  }

  async function withdraw() {
    console.log("withdrawing funds...")
    if (typeof window.ethereum !== "undefined") {
      walletClient = createWalletClient ({
        transport: custom(window.ethereum)
      });
      const [connectedAccount] = await walletClient.requestAddresses();
      const currrentChain = await getCurrentChain(walletClient)
      
      publicClient = createPublicClient ({
        transport: custom(window.ethereum)
      });
      const {request} = await publicClient.simulateContract ({
        address: contractAddress,
        abi: HimaAbi,
        chain: currrentChain,
        functionName: "withdraw",
        account: connectedAccount,
        value: parseEther(0)
      });
      const hash = await walletClient.writeContract(request)
      console.log("withdrawal transaction hash", hash)

    } else {
      connect.innerHTML = "Please install Metamask"
    }
    
  }

 connectButton.onclick = connect;
 fundButton.onclick = fund;
 balanceButton.onclick = getBalance;
 withdrawButton.onclick = withdraw;