require("dotenv").config()
const API_URL = process.env.API_URL
const PUBLIC_KEY = process.env.PUBLIC_KEY
const PRIVATE_KEY = process.env.PRIVATE_KEY

const { createAlchemyWeb3 } = require("@alch/alchemy-web3")
const web3 = createAlchemyWeb3(API_URL)

const contract = require("../artifacts/contracts/LarvaLords.sol/LarvaLords.json")
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS
const nftContract = new web3.eth.Contract(contract.abi, contractAddress)

export const tokenExists = (tokenId) => {
  return nftContract.methods.tokenExists(tokenId).encodeABI();
}

export const getTokensMinted = () => {
  return nftContract.methods.getTokensMinted().encodeABI();
}

export const mintNFT = async (tokenURI) => {
  const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, "latest") //get latest nonce

  const tokenId = Math.ceil(Math.random() * 2000 + 1);  // get tokenid

  //the transaction
  const tx = {
    from: PUBLIC_KEY,
    to: contractAddress,
    nonce: nonce,
    gas: 500000,
    data: nftContract.methods.mintSapien(PUBLIC_KEY, tokenURI, tokenId).encodeABI(),
  }

  const signPromise = web3.eth.accounts.signTransaction(tx, PRIVATE_KEY)
  signPromise
    .then((signedTx) => {
      web3.eth.sendSignedTransaction(
        signedTx.rawTransaction,
        (err, hash) => {
          if (!err) {
            console.log(
              "The hash of your transaction is: ",
              hash,
              "\nCheck Alchemy's Mempool to view the status of your transaction!"
            )
          } else {
            console.log(
              "Something went wrong when submitting your transaction:",
              err
            )
          }
        }
      )
    })
    .catch((err) => {
      console.log("Promise failed:", err)
    })
}

// mintNFT(
//   "https://gateway.pinata.cloud/ipfs/Qmd6d3s56nt8yunDLEcofLY7ytm5EUGPCzE2QWgdnAGPqT"
// )
