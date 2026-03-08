import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.connect();
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Second default Hardhat account (valid on localhost hardhat node)
  const landlordAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  const durationSeconds = 7 * 24 * 60 * 60;
  const yieldPercent = 3;
  const depositAmount = ethers.parseEther("1");

  const escrow = await ethers.deployContract(
    "RentEscrow",
    [landlordAddress, durationSeconds, yieldPercent],
    { value: depositAmount }
  );

  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();

  console.log("RentEscrow deployed to:", escrowAddress);
  console.log("Tenant (deployer) address:", deployer.address);
  console.log("Landlord address:", landlordAddress);
  console.log("Escrow amount (ETH):", ethers.formatEther(depositAmount));
  console.log("Yield %:", yieldPercent);
  console.log("Escrow deadline (unix timestamp):", Math.floor(Date.now() / 1000) + durationSeconds);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});