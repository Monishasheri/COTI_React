// src/CotiBalanceChecker.tsx
import React, { useState, useEffect, useCallback } from "react";
import { id,ethers, formatUnits } from "ethers";
import "./Model.css";
import {
  BrowserProvider,
  Eip1193Provider,
  itUint,
  JsonRpcSigner,
} from "@coti-io/coti-ethers";
import { Address } from "cluster";

// ABI for the contract
const balanceOfAddressReturnsCtUint64Fragment = {
  inputs: [
    {
      internalType: "address",
      name: "account",
      type: "address",
    },
  ],
  name: "balanceOf",
  outputs: [
    {
      internalType: "ctUint64",
      name: "",
      type: "uint256",
    },
  ],
  stateMutability: "view",
  type: "function",
} as const;

const decimalsAbiFragment = {
  inputs: [],
  name: "decimals",
  outputs: [
    {
      internalType: "uint8",
      name: "",
      type: "uint8",
    },
  ],
  stateMutability: "view",
  type: "function",
} as const;

const focusedAbi = [
  balanceOfAddressReturnsCtUint64Fragment,
  decimalsAbiFragment,
] as const;
 

 const PrivateNumberAbi= [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "ctUint64",
              "name": "ciphertext",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            }
          ],
          "internalType": "struct itUint64",
          "name": "value1",
          "type": "tuple"
        },
        {
          "components": [
            {
              "internalType": "ctUint64",
              "name": "ciphertext",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            }
          ],
          "internalType": "struct itUint64",
          "name": "value2",
          "type": "tuple"
        }
      ],
      "name": "add",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "addResult",
      "outputs": [
        {
          "internalType": "ctUint64",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "ctOutputB",
      "outputs": [
        {
          "internalType": "ctUint64",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "privateNumber",
      "outputs": [
        {
          "internalType": "ctUint64",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "reserve1",
      "outputs": [
        {
          "internalType": "ctUint64",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "reserve2",
      "outputs": [
        {
          "internalType": "ctUint64",
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
          "components": [
            {
              "internalType": "ctUint64",
              "name": "ciphertext",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            }
          ],
          "internalType": "struct itUint64",
          "name": "value",
          "type": "tuple"
        }
      ],
      "name": "setPrivateNumber",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "ctUint64",
              "name": "ciphertext",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            }
          ],
          "internalType": "struct itUint64",
          "name": "inputA",
          "type": "tuple"
        }
      ],
      "name": "swap",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
  const privateToken= [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "approver",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidApprover",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidReceiver",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidSender",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidSpender",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "ctUint64",
          "name": "ownerValue",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "ctUint64",
          "name": "spenderValue",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "ctUint64",
          "name": "senderValue",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "ctUint64",
          "name": "receiverValue",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "accountEncryptionAddress",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "isSpender",
          "type": "bool"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "internalType": "gtUint64",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "components": [
            {
              "internalType": "ctUint64",
              "name": "ciphertext",
              "type": "uint256"
            },
            {
              "internalType": "ctUint64",
              "name": "ownerCiphertext",
              "type": "uint256"
            },
            {
              "internalType": "ctUint64",
              "name": "spenderCiphertext",
              "type": "uint256"
            }
          ],
          "internalType": "struct IPrivateERC20.Allowance",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "gtUint64",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "components": [
            {
              "internalType": "ctUint64",
              "name": "ciphertext",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            }
          ],
          "internalType": "struct itUint64",
          "name": "value",
          "type": "tuple"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "ctUint64",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "gtUint64",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOfEncrypted",
      "outputs": [
        {
          "internalType": "gtUint64",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "components": [
            {
              "internalType": "ctUint64",
              "name": "ciphertext",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            }
          ],
          "internalType": "struct itUint64",
          "name": "value",
          "type": "tuple"
        }
      ],
      "name": "encryptedTransfer",
      "outputs": [
        {
          "internalType": "ctBool",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
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
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "isSpender",
          "type": "bool"
        }
      ],
      "name": "reencryptAllowance",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "offBoardAddress",
          "type": "address"
        }
      ],
      "name": "setAccountEncryptionAddress",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
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
      "inputs": [],
      "name": "totalSupply",
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
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "components": [
            {
              "internalType": "ctUint64",
              "name": "ciphertext",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            }
          ],
          "internalType": "struct itUint64",
          "name": "value",
          "type": "tuple"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "internalType": "gtBool",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "gtUint64",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "internalType": "gtBool",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "components": [
            {
              "internalType": "ctUint64",
              "name": "ciphertext",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            }
          ],
          "internalType": "struct itUint64",
          "name": "value",
          "type": "tuple"
        }
      ],
      "name": "transferFrom",
      "outputs": [
        {
          "internalType": "gtBool",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "gtUint64",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [
        {
          "internalType": "gtBool",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
  const swapPrivateABI=[
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_tokenA",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_tokenB",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "ctUint64",
              "name": "ciphertext",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            }
          ],
          "internalType": "struct itUint64",
          "name": "amountA",
          "type": "tuple"
        },
        {
          "components": [
            {
              "internalType": "ctUint64",
              "name": "ciphertext",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            }
          ],
          "internalType": "struct itUint64",
          "name": "amountB",
          "type": "tuple"
        }
      ],
      "name": "addLiquidity",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "ctOutputB",
      "outputs": [
        {
          "internalType": "ctUint64",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getUserReserves",
      "outputs": [
        {
          "internalType": "ctUint64",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "ctUint64",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "reserve1",
      "outputs": [
        {
          "internalType": "ctUint64",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "reserve2",
      "outputs": [
        {
          "internalType": "ctUint64",
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
          "components": [
            {
              "internalType": "ctUint64",
              "name": "ciphertext",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            }
          ],
          "internalType": "struct itUint64",
          "name": "inputA",
          "type": "tuple"
        }
      ],
      "name": "swap",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "tokenA",
      "outputs": [
        {
          "internalType": "contract IPrivateERC20",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "tokenB",
      "outputs": [
        {
          "internalType": "contract IPrivateERC20",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
  const tokenA_ABI=[
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "approver",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidApprover",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidReceiver",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidSender",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidSpender",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "ctUint64",
          "name": "ownerValue",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "ctUint64",
          "name": "spenderValue",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "ctUint64",
          "name": "senderValue",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "ctUint64",
          "name": "receiverValue",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "accountEncryptionAddress",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "isSpender",
          "type": "bool"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "internalType": "gtUint64",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "components": [
            {
              "internalType": "ctUint64",
              "name": "ciphertext",
              "type": "uint256"
            },
            {
              "internalType": "ctUint64",
              "name": "ownerCiphertext",
              "type": "uint256"
            },
            {
              "internalType": "ctUint64",
              "name": "spenderCiphertext",
              "type": "uint256"
            }
          ],
          "internalType": "struct IPrivateERC20.Allowance",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "gtUint64",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "components": [
            {
              "internalType": "ctUint64",
              "name": "ciphertext",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            }
          ],
          "internalType": "struct itUint64",
          "name": "value",
          "type": "tuple"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "ctUint64",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "gtUint64",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOfEncrypted",
      "outputs": [
        {
          "internalType": "gtUint64",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "components": [
            {
              "internalType": "ctUint64",
              "name": "ciphertext",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            }
          ],
          "internalType": "struct itUint64",
          "name": "value",
          "type": "tuple"
        }
      ],
      "name": "encryptedTransfer",
      "outputs": [
        {
          "internalType": "ctBool",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
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
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "isSpender",
          "type": "bool"
        }
      ],
      "name": "reencryptAllowance",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "offBoardAddress",
          "type": "address"
        }
      ],
      "name": "setAccountEncryptionAddress",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
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
      "inputs": [],
      "name": "totalSupply",
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
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "components": [
            {
              "internalType": "ctUint64",
              "name": "ciphertext",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            }
          ],
          "internalType": "struct itUint64",
          "name": "value",
          "type": "tuple"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "internalType": "gtBool",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "gtUint64",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "internalType": "gtBool",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "components": [
            {
              "internalType": "ctUint64",
              "name": "ciphertext",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            }
          ],
          "internalType": "struct itUint64",
          "name": "value",
          "type": "tuple"
        }
      ],
      "name": "transferFrom",
      "outputs": [
        {
          "internalType": "gtBool",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "gtUint64",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [
        {
          "internalType": "gtBool",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
 const CONTRACT_ADDRESS_PRIVATENUMBER="0x37f6E330F0B16216ED5fb673B603FB5da13c480c";
const CONTRACT_ADDRESS = "0x47b90ce6a1b4bcd9B2155CE962163615F3226749";
const CONTRACT_ADDRESS_PRIVATETOKEN="0xeDeB77DD2d81a0bcE8bBB63DbACBa698c7D348f7";
const CONTRACT_ADDRESS_SWAP="0x83c252BF0d24f3dB6671866c2A5F518B5a6D3849";
const TOKEN_A_ADDRESS="0xb63eB5dCb64C24a2b9db95Fd70792494298c4ef6";
const TOKEN_B_ADDRESS="0xB0E66281e3Be8CBBA0079494bCcC2637764203D7";

function CotiBalanceChecker() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [network, setNetwork] = useState<ethers.Network | null>(null);
  const [balance, setBalance] = useState<string>("Connect Wallet");
  const [decimals, setDecimals] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCotiOnboarded, setIsCotiOnboarded] = useState<boolean>(false);
  const [privateInput, setPrivateInput] = useState("");
  const [number, setNumber] = useState<String []>([]);
  const [addResult, setAddResult] = useState("");
   const [showModal, setShowModal] = useState(false);
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
 const [showSwapModal, setShowSwapModal] = useState<boolean>(false);
 const [swapInput, setSwapInput] = useState<string |"">("");
  const [outputB, setOutputB] = useState<string |null>(null);
   const [recipentAddress, setRecipentAddress] = useState("");
  const [isTransfer, setIsTransfer] = useState<boolean>(false);
 const [valueCoti, setValueCoti] = useState("")
  const [tokenModel, setTokenModel] = useState(false);
const [senderBalance, setSenderBalance] = useState("")
const [receiverBalance, setReceiverBalance] = useState("")
const [tokenAInput, setTokenAInput] = useState("")
const [tokenBInput, setTokenBInput] = useState("")
const [reserve1, setReserve1] = useState("")
const [reserve2, setReserve2] = useState("")

  // Memoized fetchDecimals
  const fetchDecimals = useCallback(
    async (currentProvider: BrowserProvider): Promise<number | null> => {
      if (!currentProvider) {
        setError("Provider not available to fetch decimals.");
        return null;
      }
      try {
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          focusedAbi,
          currentProvider
        );
        const tokenDecimalsBigInt = (await contract.decimals()) as bigint;
        const fetchedDecimals = Number(tokenDecimalsBigInt);
        setDecimals(fetchedDecimals);
        console.log(`Fetched decimals: ${fetchedDecimals}`);
        return fetchedDecimals;
      } catch (err: any) {
        console.error("Error fetching decimals:", err);
        setError(
          `Error fetching decimals: ${
            err.message || "Unknown error"
          }. Defaulting to 6.`
        );
        setDecimals(6);
        return 6;
      }
    },
    []
  ); // Dependencies for fetchDecimals: None as it only uses props/state passed to it

  // Memoized fetchBalance
  const fetchBalance = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!account) {
      setError("Please connect your wallet first.");
      setLoading(false);
      return;
    }
    if (!provider) {
      setError("Ethereum provider not available. Please connect MetaMask.");
      setLoading(false);
      return;
    }
    if (!isCotiOnboarded) {
      setError(
        "COTI account not onboarded. Please onboard your account first."
      );
      setLoading(false);
      return;
    }
    if (!signer) {
      setError("Signer not available. Ensure MetaMask is fully connected.");
      setLoading(false);
      return;
    }

    const currentDecimals = decimals ?? (await fetchDecimals(provider));
    if (currentDecimals === null) {
      setError("Could not determine token decimals. Cannot format balance.");
      setLoading(false);
      return;
    }

    try {
      const perciToken = new ethers.Contract(
        CONTRACT_ADDRESS,
        focusedAbi,
        provider
      );

      console.log(
        `Frontend fetching ctUint64 balance for ${account} from contract ${CONTRACT_ADDRESS}...`
      );

      const ctBalance_uint256 = (await perciToken["balanceOf(address)"](
        account
      )) as bigint;

      console.log(
        "Frontend returned encrypted ctBalance (BigInt):",
        ctBalance_uint256.toString()
      );

      let numericDecryptedBalance: bigint | string | undefined;
      try {
        numericDecryptedBalance = await signer.decryptValue(ctBalance_uint256);

        if (
          typeof numericDecryptedBalance === "string" &&
          numericDecryptedBalance.startsWith("0x")
        ) {
          numericDecryptedBalance = BigInt(numericDecryptedBalance);
        }

        if (numericDecryptedBalance !== undefined) {
          console.log(
            `Frontend decrypted balance via signer: ${numericDecryptedBalance.toString()}`
          );
        } else {
          throw new Error("Decryption returned undefined.");
        }
      } catch (decryptionError: any) {
        console.error("Error during decryption via signer:", decryptionError);
        setError(
          `Decryption failed: ${
            decryptionError.message || "Unknown error"
          }. Ensure COTI Snap is installed and account is onboarded.`
        );
        setBalance("Decryption Error");
        setLoading(false);
        return;
      }

      if (numericDecryptedBalance === undefined) {
        throw new Error(
          "Failed to decrypt balance via signer. Result was undefined."
        );
      }

      const formatted = formatUnits(
        numericDecryptedBalance as bigint,
        currentDecimals
      );
      console.log(`Formatted decrypted balance: ${formatted} PERCI`);
      setBalance(formatted);
    } catch (err: any) {
      console.error("Error in frontend process:", err);
      setError(
        `Error fetching or decrypting balance: ${
          err.message || "Unknown error"
        }`
      );
      setBalance("Error");
    } finally {
      setLoading(false);
    }
  }, [account, provider, decimals, fetchDecimals, isCotiOnboarded, signer]); // Dependencies for fetchBalance

    // Memoized COTI Account Onboarding Function
    const onboardCotiAccount = useCallback(async () => {
      setLoading(true);
      setError(null);
      if (!signer) {
        setError("MetaMask signer not available. Please connect wallet first.");
        setLoading(false);
        return;
      }

      try {
        console.log("Attempting to onboard COTI account via MetaMask Snap...");
        await signer.generateOrRecoverAes();
        console.log("COTI account onboarding successful!");

        const onboardInfo = await signer.getUserOnboardInfo();
        if (onboardInfo && onboardInfo.aesKey) {
          setIsCotiOnboarded(true);
          console.log("COTI Account is onboarded. AES Key available (via Snap).");
          fetchBalance(); // Now that onboarding is complete, fetch the balance
        } else {
          setError(
            "COTI onboarding completed, but AES key not confirmed by Snap. Please verify Snap status."
          );
        }
      } catch (err: any) {
        console.error("Error onboarding COTI account:", err);
        setError(
          `Failed to onboard COTI account: ${
            err.message || "Unknown error"
          }. Ensure COTI Snap is installed and active.`
        );
      } finally {
        setLoading(false);
      }
    }, [signer, fetchBalance]); // Dependencies for onboardCotiAccount

  // Handlers for MetaMask events, defined *before* the main useEffect
  const handleAccountsChanged = useCallback(
    async (accounts: string[]) => {
      if (accounts.length === 0) {
        setAccount(null);
        setSigner(null);
        setBalance("Connect Wallet");
        setIsCotiOnboarded(false);
        console.log("Please connect to MetaMask.");
      } else {
        const newAccount = accounts[0];
        setAccount(newAccount);
        const ethProvider = new BrowserProvider(
          window.ethereum as Eip1193Provider
        );
        setProvider(ethProvider);
        const ethSigner = await ethProvider.getSigner(newAccount);
        setSigner(ethSigner);

        try {
          const onboardInfo = await ethSigner.getUserOnboardInfo();
          if (onboardInfo && onboardInfo.aesKey) {
            setIsCotiOnboarded(true);
            console.log("COTI Account already onboarded after account change.");
            fetchBalance();
          } else {
            setIsCotiOnboarded(false);
            console.log(
              "COTI Account not onboarded after account change. Please onboard."
            );
          }
        } catch (onboardCheckErr: any) {
          console.warn(
            "Could not verify COTI onboarding status after account change:",
            onboardCheckErr
          );
          setIsCotiOnboarded(false);
          setError(
            `Could not verify COTI onboarding status after account change: ${
              onboardCheckErr.message || "Unknown error"
            }. Ensure Snap is installed.`
          );
        }
        console.log("Account changed to:", newAccount);
      }
    },
    [fetchBalance]
  );
 
  const handleChainChanged = useCallback((chainId: string) => {
    console.log("Chain changed to:", chainId);
    window.location.reload();
  }, []);

  // Main useEffect for wallet initialization and event listeners
  useEffect(() => {
    const initWallet = async () => {
      if (window.ethereum) {
        const ethProvider = new BrowserProvider(
          window.ethereum as Eip1193Provider
        );
        setProvider(ethProvider);

        ethProvider
          .getNetwork()
          .then((net) => {
            setNetwork(net);
          })
          .catch((err: any) => {
            console.error("Error getting network:", err);
            setError("Could not determine network. Is MetaMask connected?");
          });

        // Use 'as any' for event listener methods
        (window.ethereum as any).on("accountsChanged", handleAccountsChanged);
        (window.ethereum as any).on("chainChanged", handleChainChanged);

        ethProvider
          .listAccounts()
          .then(async (accounts) => {
            if (accounts.length > 0) {
              const connectedAccount = accounts[0].address;
              setAccount(connectedAccount);
              const ethSigner = await ethProvider.getSigner(connectedAccount);
              setSigner(ethSigner);

              try {
                const onboardInfo = await ethSigner.getUserOnboardInfo();
                if (onboardInfo && onboardInfo.aesKey) {
                  setIsCotiOnboarded(true);
                  console.log("COTI Account already onboarded.");
                  // We explicitly call fetchBalance here if already onboarded.
                  // This ensures it runs once on mount if already connected/onboarded.
                  fetchBalance();
                } else {
                  setIsCotiOnboarded(false);
                  console.log("COTI Account not onboarded. Please onboard.");
                }
              } catch (onboardCheckErr: any) {
                console.warn(
                  "Could not verify COTI onboarding status:",
                  onboardCheckErr
                );
                setIsCotiOnboarded(false);
                setError(
                  `Could not verify COTI onboarding status: ${
                    onboardCheckErr.message || "Unknown error"
                  }. Ensure Snap is installed.`
                );
              }
            }
          })
          .catch((err: any) => {
            console.error("Error listing accounts:", err);
            setError(
              "Error listing accounts. Please ensure MetaMask is unlocked."
            );
          });
      } else {
        setError(
          "MetaMask is not installed. Please install it to use this app."
        );
      }
    };

    initWallet();

    return () => {
      if (window.ethereum) {
        (window.ethereum as any).removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        (window.ethereum as any).removeListener(
          "chainChanged",
          handleChainChanged
        );
      }
    };
  }, []); // *** REMOVED fetchBalance from dependencies here ***

  // Connect Wallet Function (no changes here as it's triggered by user click)
  const connectWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!window.ethereum) {
        setError("MetaMask is not installed.");
        return;
      }

      const accounts = (await (window.ethereum as Eip1193Provider).request({
        method: "eth_requestAccounts",
      })) as string[];
      if (accounts.length > 0) {
        const connectedAccount = accounts[0];
        setAccount(connectedAccount);
        const ethProvider = new BrowserProvider(
          window.ethereum as Eip1193Provider
        );
        setProvider(ethProvider);
        const ethSigner = await ethProvider.getSigner(connectedAccount);
        setSigner(ethSigner);

        const net = await ethProvider.getNetwork();
        setNetwork(net);
        console.log(
          "Connected to network:",
          net.name,
          `(Chain ID: ${Number(net.chainId)})`
        );

        await fetchDecimals(ethProvider);

        try {
          const onboardInfo = await ethSigner.getUserOnboardInfo();
          if (onboardInfo && onboardInfo.aesKey) {
            setIsCotiOnboarded(true);
            console.log(
              "COTI Account already onboarded after initial connect."
            );
            fetchBalance();
          } else {
            setIsCotiOnboarded(false);
            console.log("COTI Account not onboarded. Please onboard.");
          }
        } catch (onboardCheckErr: any) {
          console.warn(
            "Could not verify COTI onboarding status after initial connect:",
            onboardCheckErr
          );
          setIsCotiOnboarded(false);
          setError(
            `Could not verify COTI onboarding status: ${
              onboardCheckErr.message || "Unknown error"
            }. Ensure Snap is installed.`
          );
        }
      }
    } catch (err: any) {
      console.error("Error connecting to MetaMask:", err);
      setError(`Error connecting: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

 const setPrivateNumber = useCallback(async () => {
  setLoading(true);
  setError(null);

  if (!account || !signer || !provider) {
    setError("Wallet not connected or signer/provider missing.");
    setLoading(false);
    return;
  }

  if (!privateInput || isNaN(Number(privateInput))) {
    setError("Please enter a valid number.");
    setLoading(false);
    return;
  }

  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS_PRIVATENUMBER,PrivateNumberAbi , signer);

    console.log("Encrypting number using Snap signer...");
    

 const functionSelector = id("setPrivateNumber((uint256,bytes))").slice(0, 10);
const itValue = await signer.encryptValue(
  BigInt(privateInput),
  CONTRACT_ADDRESS_PRIVATENUMBER,
  functionSelector
) as itUint;

console.log("Encrypted value:", itValue);
    const tx = await contract.setPrivateNumber(itValue); // make sure ABI matches!
    await tx.wait();
    setPrivateInput("");
    console.log("Private number set successfully!");
    alert("Private number set successfully!");
     setPrivateInput("");
  } catch (err: any) {
    console.error("Error setting private number:", err);
    setError(`Failed to set private number: ${err.message || "Unknown error"}`);
  } finally {
    setLoading(false);
  }
}, [account, signer, provider, privateInput]);


const getPrivateNumber = useCallback(async () => {
  setLoading(true);
  setError(null);

  if (!account || !signer || !provider || !CONTRACT_ADDRESS_PRIVATENUMBER) {
    setError("Wallet not connected or signer/provider/address missing.");
    setLoading(false);
    return;
  }
console.log("Signer address:", await signer.getAddress());
  try {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS_PRIVATENUMBER,
      PrivateNumberAbi,
      signer
    );

    const encryptedValue = await contract.privateNumber();
    console.log("Encrypted value from contract:", encryptedValue);

    const decrypted = await signer.decryptValue(encryptedValue);

    let finalValue: string | undefined;
    if (typeof decrypted === "string" && decrypted.startsWith("0x")) {
      finalValue = BigInt(decrypted).toString();
    } else if (typeof decrypted === "bigint") {
      finalValue = decrypted.toString();
    } else {
      throw new Error("Unexpected decryption format or empty result");
    }

    console.log("Decrypted private number:", finalValue);
    if (finalValue) {
  setNumber((prevList) => [...prevList, finalValue]);
}

  } catch (err: any) {
    console.error("Error in getPrivateNumber:", err);
    setError(`Failed to get private number: ${err.message || "Unknown error"}`);
  } finally {
    setLoading(false);
  }
}, [account, signer, provider, CONTRACT_ADDRESS_PRIVATENUMBER]);

const getAddResult = useCallback(async () => {
  setLoading(true);
  setError(null);

  if (!account || !signer || !provider || !CONTRACT_ADDRESS_PRIVATENUMBER) {
    setError("Wallet not connected or signer/provider/address missing.");
    setLoading(false);
    return;
  }
  // if(addResult==null){
  //   alert("No Result Found!Go and ADD it")
  //   return;
  // }

  try {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS_PRIVATENUMBER,
      PrivateNumberAbi,
      signer
    );

    const encryptedValue = await contract.addResult();
    console.log("Encrypted value from contract:", encryptedValue);

    const decrypted = await signer.decryptValue(encryptedValue);

    let finalValue: string | undefined;
    if (typeof decrypted === "string" && decrypted.startsWith("0x")) {
      finalValue = BigInt(decrypted).toString();
    } else if (typeof decrypted === "bigint") {
      finalValue = decrypted.toString();
    } else {
      throw new Error("Unexpected decryption format or empty result");
    } 

    console.log("Decrypted private number:", finalValue);
  setAddResult(finalValue);

  } catch (err: any) {
    console.error("Error in getPrivateNumber:", err);
    setError(`Failed to get private number: ${err.message || "Unknown error"}`);
  } finally {
    setLoading(false);
  }
}, [account, signer, provider, CONTRACT_ADDRESS_PRIVATENUMBER]);

const handleAdd = useCallback(async () => {
  setLoading(true);
  setError(null);

  if (!account || !signer || !provider) {
    setError("Wallet not connected or signer/provider missing.");
    setLoading(false);
    return;
  }

  if (!input1||!input2 || isNaN(Number(input1))||isNaN(Number(input1))) {
    setError("Please enter a valid number.");
    setLoading(false);
    return;
  }

  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS_PRIVATENUMBER,PrivateNumberAbi , signer);

    console.log("Encrypting number using Snap signer...");
    
const addSelector = id("add((uint256,bytes),(uint256,bytes))").slice(0, 10);
 
const itValue1 = await signer.encryptValue(
  BigInt(input1),
  CONTRACT_ADDRESS_PRIVATENUMBER,
  addSelector
) as itUint;
const itValue2 = await signer.encryptValue(
  BigInt(input2),
  CONTRACT_ADDRESS_PRIVATENUMBER,
  addSelector
) as itUint;
console.log("Encrypted value:", itValue1,itValue2);
    const tx = await contract.add(itValue1,itValue2);
    await tx.wait();
    await getAddResult(); 
    console.log("Add successfully!");
    alert("Add successfully!");
    setInput1("");
    setInput2("");
  } catch (err: any) {
    console.error("Error add numbers:", err);
    setError(`Failed to add numbers: ${err.message || "Unknown error"}`);
  } finally {
    setLoading(false);
  }
}, [account, signer, provider, privateInput]);


const handleSwap = useCallback(async () => {
  setLoading(true);
  setError(null);

  if (!account || !signer || !provider) {
    setError("Wallet not connected or signer/provider missing.");
    setLoading(false);
    return;
  }

  if (!swapInput || isNaN(Number(swapInput))) {
    setError("Please enter a valid number.");
    setLoading(false);
    return;
  }

  try {
    // Prepare contract instances
    const tokenAContract = new ethers.Contract(TOKEN_A_ADDRESS, tokenA_ABI, signer);
    const swapContract = new ethers.Contract(CONTRACT_ADDRESS_SWAP, swapPrivateABI, signer);

    // Encrypt the swap amount for the approve call
    const approveSelector = id("approve(address,(uint256,bytes))").slice(0, 10);
    const encryptedSwapAmount = await signer.encryptValue(
      BigInt(swapInput),
      TOKEN_A_ADDRESS,
      approveSelector
    );

    // Approve the swap contract to spend the encrypted amount
    const approveTx = await tokenAContract["approve(address,(uint256,bytes))"](
      CONTRACT_ADDRESS_SWAP,
      encryptedSwapAmount
    );
    await approveTx.wait();
    console.log("Approved Token A for swap");

    // Encrypt the swap amount for the swap call
    const swapSelector = swapContract.swap.fragment.selector;
    const encryptedSwapValue = await signer.encryptValue(
      BigInt(swapInput),
      CONTRACT_ADDRESS_SWAP,
      swapSelector
    );

    // Call swap
    const tx = await swapContract.swap(encryptedSwapValue);
    const receipt = await tx.wait();
    console.log("Swap successfully!", receipt);
    alert("Swap successfully!");
    await getOutputB();
    setSwapInput("");
  } catch (err: any) {
    console.error("Error swap numbers:", err);
    setError(`Failed to swap numbers: ${err.message || "Unknown error"}`);
  } finally {
    setLoading(false);
  }
}, [account, signer, provider, swapInput]);

const getOutputB = useCallback(async () => {
  setLoading(true);
  setError(null);

  if (!account || !signer || !provider ) {
    setError("Wallet not connected or signer/provider/address missing.");
    setLoading(false);
    return;
  }

  try {
   const contract = new ethers.Contract(CONTRACT_ADDRESS_SWAP,swapPrivateABI , signer);
    const encryptedValue = await contract.ctOutputB();
    console.log("Encrypted value from contract:", encryptedValue);

    const decrypted = await signer.decryptValue(encryptedValue);
    console.log("✅ Swapped Output (decrypted):", decrypted.toString()); 

    let finalValue: string | undefined;
    if (typeof decrypted === "string" && decrypted.startsWith("0x")) {
      finalValue = BigInt(decrypted).toString();
    } else if (typeof decrypted === "bigint") {
      finalValue = decrypted.toString();
    } else {
      throw new Error("Unexpected decryption format or empty result");
    }
    console.log("Decrypted private number:", finalValue);
    setOutputB(finalValue);
  } catch (err: any) {
    console.error("Error in getPrivateNumber:", err);
    setError(`Failed to get private number: ${err.message || "Unknown error"}`);
  } finally {
    setLoading(false);
  }
}, [account, signer, provider, CONTRACT_ADDRESS_PRIVATENUMBER]);

const handleTransfer = useCallback(async () => {
  setLoading(true); setError(null);

  if (!account || !signer || !provider) {
    setError("Wallet not connected or signer/provider missing.");
    return;
  }
  if (!valueCoti) {
    setError("Please enter a valid number.");
    return;
  }

  try {
    const code = await provider.getCode(CONTRACT_ADDRESS_PRIVATETOKEN);
    if (code === "0x") throw new Error("PrivateToken contract not found on this network");
 
    const contract = new ethers.Contract(CONTRACT_ADDRESS_PRIVATETOKEN, privateToken, signer);
    console.log("Encrypting number using Snap signer…");

    // const addSelector = id("encryptedTransfer((uint256,bytes))").slice(0, 10);
    const itValue1 = await signer.encryptValue(
      BigInt(valueCoti),
      CONTRACT_ADDRESS_PRIVATETOKEN,
      contract.encryptedTransfer.fragment.selector
    ) as itUint;

    console.log("Encrypted value:", itValue1);
    console.log("REceiver Address:",recipentAddress)
    const tx = await contract.encryptedTransfer(recipentAddress, itValue1);
    const receipt = await tx.wait();
    setIsTransfer(receipt.status);
     const senderBalance=await contract.balanceOfEncrypted(account);
     const ReceiverBalance=await contract.balanceOfEncrypted(recipentAddress);

     console.log("garbled sender balance:", senderBalance);
     console.log("garbled Receiver balance:", ReceiverBalance);

    const senderdecrypted = await signer.decryptValue(senderBalance);
     const receiverdecrypted = await signer.decryptValue(ReceiverBalance);
    let senderValue: string | undefined;
    let receiverValue:string | undefined;
    if (typeof senderdecrypted === "string" && senderdecrypted.startsWith("0x")) {
      senderValue = BigInt(senderdecrypted).toString();
    } else if (typeof senderdecrypted === "bigint") {
      senderValue = senderdecrypted.toString();
    } else {
      throw new Error("Unexpected decryption format or empty result");
    }
     
    setSenderBalance(senderValue);

     if (typeof receiverdecrypted === "string" && receiverdecrypted.startsWith("0x")) {
      receiverValue = BigInt(receiverdecrypted).toString();
    } else if (typeof receiverdecrypted === "bigint") {
      receiverValue = receiverdecrypted.toString();
    } else {
      throw new Error("Unexpected decryption format or empty result");
    }
    setReceiverBalance(receiverValue);
   
    alert("Transfer successfully!");
    setValueCoti("");

  } catch (err: any) {
    console.error("Error add numbers:", err);

    // Log ethers.js detailed error fields
    console.error("Reason:", err.reason);
    console.error("Revert data:", err.data);
    console.error("Receipt:", err.receipt);

    let msg = err.reason
      || err.error?.message
      || (err.data ? "Transaction reverted with data" : "Transaction reverted without reason");
    setError(`Transfer failed: ${msg}`);
  } finally {
    setLoading(false);
  }
},  [account, signer, provider, CONTRACT_ADDRESS_PRIVATETOKEN]);


const getReserves = useCallback(async () => {

    if (!provider || !signer || !account) {
      console.error("Wallet not connected");
      return;
    }
   try {
   const swapContract = new ethers.Contract(CONTRACT_ADDRESS_SWAP, swapPrivateABI, signer);
  //  const tokenAContract = new ethers.Contract(TOKEN_A_ADDRESS, tokenA_ABI, signer);
  //   const tokenBContract = new ethers.Contract(TOKEN_B_ADDRESS, tokenA_ABI, signer);
  const reserves = await swapContract.getUserReserves();
  console.log(reserves);
  //  const totalsupply_TokenA=await tokenAContract.totalSupply();
  //  const totalsupply_TokenB=await tokenBContract.totalSupply();
  //  console.log("Token A TotalSupply",totalsupply_TokenA)
  //  console.log("Token B TotalSupply",totalsupply_TokenB)
    const userReserve1 = await swapContract.reserve1();
     const userReserve2 = await swapContract.reserve2();
    const decryptedreserve1 = await signer.decryptValue(userReserve1);
     const decryptedreserve2 = await signer.decryptValue(userReserve2);

    let finalValue: string | undefined;
    if (typeof decryptedreserve1 === "string" && decryptedreserve1.startsWith("0x")) {
      finalValue = BigInt(decryptedreserve1).toString();
    } else if (typeof decryptedreserve1 === "bigint") {
      finalValue = decryptedreserve1.toString();
    } else {
      throw new Error("Unexpected decryption format or empty result");
    }
    console.log("Decrypted private number:", finalValue);
    setReserve1(finalValue);

    let finalValue2: string | undefined;
    if (typeof decryptedreserve2 === "string" && decryptedreserve2.startsWith("0x")) {
      finalValue2 = BigInt(decryptedreserve2).toString();
    } else if (typeof decryptedreserve2 === "bigint") {
      finalValue2 = decryptedreserve2.toString();
    } else {
      throw new Error("Unexpected decryption format or empty result");
    }
    console.log("Decrypted private number:", finalValue2);
    setReserve2(finalValue2);
  } catch (err: any) {
    console.error("Error in getReserve:", err);
    setError(`Failed to getReserver: ${err.message || "Unknown error"}`);
  } finally {
    setLoading(false); 
  } 
}, [provider, signer, account,CONTRACT_ADDRESS_SWAP]);


const addLiquidity = useCallback(async () => {
  setLoading(true); setError(null);

  if (!account || !signer || !provider) {
    setError("Wallet not connected or signer/provider missing.");
    return;
  }
  if (!tokenAInput || !tokenBInput) {
    setError("Please enter a valid number.");
    return;
  }
  try {
    const tokenAContract = new ethers.Contract(TOKEN_A_ADDRESS, tokenA_ABI, signer);
    const tokenBContract = new ethers.Contract(TOKEN_B_ADDRESS, tokenA_ABI, signer);
    const swapContract = new ethers.Contract(CONTRACT_ADDRESS_SWAP, swapPrivateABI, signer);

    // Encrypt tokenA and tokenB amounts for approval
    const approveSelector = id("approve(address,(uint256,bytes))").slice(0, 10);
    const encryptedTokenA = await signer.encryptValue(BigInt(tokenAInput), TOKEN_A_ADDRESS, approveSelector);
    const encryptedTokenB = await signer.encryptValue(BigInt(tokenBInput), TOKEN_B_ADDRESS, approveSelector);

    // Check balances using the user's address
    const balanceA = await tokenAContract["balanceOf(address)"](account);
    console.log("Balance of Token A", balanceA);
    const balanceB = await tokenBContract["balanceOf(address)"](account);
    console.log("Balance of Token B", balanceB);

    // Approve both tokens for the swap contract
    const approveATx = await tokenAContract["approve(address,(uint256,bytes))"](CONTRACT_ADDRESS_SWAP, encryptedTokenA);
    await approveATx.wait();
    console.log("Approved Token A");

    const approveBTx = await tokenBContract["approve(address,(uint256,bytes))"](CONTRACT_ADDRESS_SWAP, encryptedTokenB);
    await approveBTx.wait();
    console.log("Approved Token B");

    // Encrypt again for contract call (with correct selector and contract address)
    const liquiditySelector = id("addLiquidity((uint256,bytes),(uint256,bytes))").slice(0, 10);
    const encryptedAForCall = await signer.encryptValue(BigInt(tokenAInput), CONTRACT_ADDRESS_SWAP, liquiditySelector);
    const encryptedBForCall = await signer.encryptValue(BigInt(tokenBInput), CONTRACT_ADDRESS_SWAP, liquiditySelector);

    // Call addLiquidity()
    const tx = await swapContract.addLiquidity(encryptedAForCall, encryptedBForCall);
    const receipt = await tx.wait();

    console.log("Liquidity added successfully!", receipt);
    alert("Liquidity added!");

    // Reset input fields
    setTokenAInput("");
    setTokenBInput("");
  } catch (err) {
    console.error("Error adding liquidity:", err);
    alert("Add Liquidity failed. Check console.");
  }
}, [account, signer, provider, CONTRACT_ADDRESS_SWAP]);


  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "auto",
        border: "1px solid black",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}>
      <h1>COTI Private Token Balance Checker (MetaMask Snap Integration)</h1>

      {error && (
        <p style={{ color: "red", marginTop: "15px", fontWeight: "bold" }}>
          Error: {error}
        </p>
      )}

      {!account ? (
        <button
          onClick={connectWallet}
          disabled={loading}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            opacity: !loading ? 1 : 0.5,
            transition: "opacity 0.3s ease",
          }}>
          {loading ? "Connecting..." : "Connect MetaMask"}
        </button>
      ) : (
        <div>
          <p>
            <strong>Connected Account:</strong> {account}
          </p>
          <p>
            <strong>Network:</strong>{" "}
            {network
              ? `${network.name} (ID: ${Number(network.chainId)})`
              : "Loading..."}
          </p>
          <p>
            <strong>Contract Address:</strong> {CONTRACT_ADDRESS}
          </p>
          {decimals !== null && (
            <p>
              <strong>Token Decimals:</strong> {decimals}
            </p>
          )}

          {!isCotiOnboarded ? (
            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                border: "1px dashed #ffa500",
                borderRadius: "5px",
                backgroundColor: "#fffbe6",
              }}>
              <p style={{ color: "#8b4513" }}>
                Your COTI account is not onboarded. Please click the button
                below to onboard it via MetaMask Snap.
              </p>
              <button
                onClick={onboardCotiAccount}
                disabled={loading || !signer}
                style={{
                  padding: "10px 20px",
                  fontSize: "16px",
                  cursor: "pointer",
                  backgroundColor: "#ff8c00",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  marginTop: "10px",
                  opacity: !loading && signer ? 1 : 0.5,
                  transition: "opacity 0.3s ease",
                }}>
                {loading ? "Onboarding..." : "Onboard COTI Account"}
              </button>
            </div>
          ) : (
            <>
              <p>
                <strong>COTI Onboarding Status:</strong>{" "}
                <span style={{ color: "green", fontWeight: "bold" }}>
                  Onboarded!
                </span>
              </p>
              <p>
                <strong>Balance:</strong> {balance} PERCI
              </p>
              <button
                onClick={fetchBalance}
                disabled={loading || !account || !isCotiOnboarded}
                style={{
                  padding: "10px 20px",
                  fontSize: "16px",
                  cursor: "pointer",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  marginTop: "10px",
                  opacity: !loading && account && isCotiOnboarded ? 1 : 0.5,
                  transition: "opacity 0.3s ease",
                }}>
                {loading ? "Fetching..." : "Fetch Private Balance"}
              </button>
  
  
  <div className="highlight-box">
  <h3 style={{ marginBottom: "10px" }}>Private Number Actions</h3>
  {/* Set Private Number */}
  <input
    type="number"
    value={privateInput}
    onChange={(e) => setPrivateInput(e.target.value)}
    placeholder="Enter number"
    style={{
      padding: "10px",
      fontSize: "16px",
      marginBottom: "10px",
      width: "150px",
      borderRadius: "6px",
      border: "1px solid #ccc"
    }}
  />
  <button
    onClick={setPrivateNumber}
    disabled={loading || !signer}
    className="action-btn orange-btn"
  >
    {loading ? "Setting..." : "Set Private Number"}
  </button>

  <br /><br />

  {/* Get Private Number */}
  <button
    onClick={getPrivateNumber}
    disabled={loading}
    className="action-btn teal-btn"
  >
    {loading ? "Getting..." : "Get Private Number"}
  </button>

  {number.length > 0 && (
    <div style={{ marginTop: "10px" }}>
      <strong>Private Numbers:</strong>
      <ul>
        {number.map((num, index) => (
          <li key={index}>{num}</li>
        ))}
      </ul>
    </div>
  )}

  <br />

  {/* Get Result */}
  <button
    onClick={getAddResult}
    disabled={loading}
    className="action-btn green-btn"
  >
    {loading ? "Getting..." : "Get Add Result"}
  </button>

  {addResult && (
    <div className="result-box">
      <strong>Addition Result:</strong> <span>{addResult}</span>
    </div>
  )}

  <br /><br />

  {/* Add Modal Trigger */}
  <button onClick={() => setShowModal(true)} className="action-btn blue-btn">
    ➕ Add
  </button>

  {showModal && (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Enter Values to Add</h2>
        <input
          type="number"
          placeholder="Enter first number"
          value={input1}
          onChange={(e) => setInput1(e.target.value)}
        />
        <input
          type="number"
          placeholder="Enter second number"
          value={input2}
          onChange={(e) => setInput2(e.target.value)}
        />
        <div className="modal-buttons">
          <button onClick={handleAdd} className="submit-btn">Add</button>
          <button onClick={() => setShowModal(false)} className="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  )}
</div>


<div className="highlight-box">
<h3 style={{ marginBottom: "10px" }}>Token Actions</h3>
<div style={{ fontFamily: "Arial, sans-serif", padding: "10px" }}>
<button onClick={() => setShowSwapModal(true)} className="action-btn blue-btn">
    🔁 Swap
  </button>

  {showSwapModal && (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Swap Token</h2>
        <input
          type="number"
          placeholder="Enter amount to swap"
          value={swapInput}
          onChange={(e) => setSwapInput(e.target.value)}
        />
        <div className="modal-buttons">
          <button onClick={handleSwap} className="submit-btn">Swap</button>
          <button onClick={() => setShowSwapModal(false)} className="cancel-btn">Cancel</button>
        </div>

        {outputB !== null && (
          <div style={{ marginTop: "10px" }}>
            <strong>Swapped Output:</strong> {outputB}
          </div>
        )}
      </div>
    </div>
  )}
</div>
<div style={{ fontFamily: "Arial, sans-serif", padding: "10px" }}>
   <button onClick={() => setTokenModel(true)} className="action-btn purple-btn">
    🔄 Transfer
  </button>
 

  {tokenModel && ( // ✅ fixed conditional
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Transfer COTI</h2>
        <input
          type="number"
          placeholder="Enter COTI"
          value={valueCoti}
          onChange={(e) => setValueCoti(e.target.value)}
        />
        <input
          type="text" // ✅ fixed type
          placeholder="Enter address"
          value={recipentAddress}
          onChange={(e) => setRecipentAddress(e.target.value)}
        />
        <div className="modal-buttons">
          <button onClick={handleTransfer} className="submit-btn">Transfer</button> {/* ✅ button label fixed */}
          <button onClick={() => setTokenModel(false)} className="cancel-btn">Cancel</button>
        </div>
        {isTransfer !== false  && (
          <div style={{ marginTop: "10px" }}>
            <strong>Transfer Status:</strong> Success
          </div>
        )}
         {senderBalance && (
          <div style={{ marginTop: "10px" }}>
            <strong>Sender Balance:</strong> {senderBalance}
          </div>
        )}
         {receiverBalance && ( 
          <div style={{ marginTop: "10px" }}>
            <strong>Receiver Balance:</strong> {receiverBalance}
          </div>
        )}
      </div>
    </div>
  )}
</div>

<div style={{ fontFamily: "Arial, sans-serif", padding: "10px" }}>
<button onClick={() => setTokenModel(true)} className="action-btn teal-btn">
    💧 Add Liquidity
  </button>
  {tokenModel && ( 
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add Liquidity</h2>
        <input
          type="number"
          placeholder="Enter COTI Token"
          value={tokenAInput}
          onChange={(e) => setTokenAInput(e.target.value)}
        />
        <input
          type="number" 
          placeholder="Enter COTI Token"
          value={tokenBInput}
          onChange={(e) => setTokenBInput(e.target.value)}
        />
        <div className="modal-buttons">
          <button onClick={addLiquidity} className="submit-btn">add</button>
          <button onClick={() => setTokenModel(false)} className="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  )}
</div>

<div style={{ fontFamily: "Arial, sans-serif", padding: "10px" }}>
  <button onClick={getReserves} disabled={loading} className="action-btn green-btn">
    🌊 View Pool
  </button>

  {reserve1 && (
  <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "5px" }}>
    <strong>Reserve1 Pool:</strong> <span style={{ color: "#28a745" }}>{reserve1}</span>
  </div>
)}
 {reserve2 && (
  <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "5px" }}>
    <strong>Reserve2 Pool:</strong> <span style={{ color: "#28a745" }}>{reserve2}</span>
  </div>
)}
</div>
</div>

            </>
          )}
        </div>
      )}
    </div>
  );
}

export default CotiBalanceChecker;