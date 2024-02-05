export const brc20bABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "protocolStr",
        "type": "string"
      }
    ],
    "name": "getTicks",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "protocol",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "tick",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "protocol",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "tickStr",
        "type": "string"
      }
    ],
    "name": "getMaxSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "protocol",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "tickStr",
        "type": "string"
      }
    ],
    "name": "getTotalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
