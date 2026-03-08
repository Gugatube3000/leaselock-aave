// Aave V3 Sepolia Testnet Configuration
// Addresses from: https://github.com/bgd-labs/aave-address-book

export const SEPOLIA_CHAIN_ID = 11155111;

export const SEPOLIA_CONFIG = {
  chainId: SEPOLIA_CHAIN_ID,
  chainIdHex: "0xaa36a7",
  chainName: "Sepolia Testnet",
  rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
  blockExplorer: "https://sepolia.etherscan.io",
  nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
};

// Aave V3 addresses on Sepolia
export const AAVE_ADDRESSES = {
  POOL: "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951",
  WETH: "0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c",
  A_WETH: "0x5b071b590a59395fE4025A0Ccc1FcC931AAc1830",
};

// localStorage key for tracking deployed escrow addresses
export const ESCROW_ADDRESSES_KEY = "leaselock-escrow-addresses-v2";
