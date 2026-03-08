import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.connect();
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);

  // ----- Configuration -----
  // Replace with the account that should receive released rent.
  const landlordAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  const durationSeconds = 7 * 24 * 60 * 60; // 7 days
  const depositAmount = ethers.parseEther("1");

  // Aave V3 addresses (Sepolia testnet)
  // Update these for your target network:
  // Mainnet WETH: 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
  // Mainnet Pool: 0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2
  // Mainnet aWETH: 0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8
  const WETH_ADDRESS = "0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3B";      // Sepolia WETH
  const AAVE_POOL_ADDRESS = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951";  // Sepolia Aave V3 Pool
  const AWETH_ADDRESS = "0x5b071b590a59395fE4025A0Ccc1FcC931AAc1830";      // Sepolia aWETH

  // ----- Deploy AaveRentEscrow -----
  const aaveRentEscrow = await ethers.deployContract(
    "AaveRentEscrow",
    [landlordAddress, durationSeconds, AAVE_POOL_ADDRESS, WETH_ADDRESS, AWETH_ADDRESS],
    { value: depositAmount }
  );

  await aaveRentEscrow.waitForDeployment();

  const address = await aaveRentEscrow.getAddress();
  console.log(`\n✅ AaveRentEscrow deployed at: ${address}`);
  console.log(`   Tenant (deployer): ${deployer.address}`);
  console.log(`   Landlord:          ${landlordAddress}`);
  console.log(`   Deposit (ETH):     ${ethers.formatEther(depositAmount)}`);
  console.log(`   Duration:          ${durationSeconds / 86400} days`);
  console.log(`   Aave Pool:         ${AAVE_POOL_ADDRESS}`);
  console.log(`   WETH:              ${WETH_ADDRESS}`);
  console.log(`   aWETH:             ${AWETH_ADDRESS}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
