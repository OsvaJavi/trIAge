// blockchain/scripts/deploy.js

const hre = require("hardhat");

async function main() {
  console.log("Deploying TriageLogger to", hre.network.name, "...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance: ", hre.ethers.formatEther(balance), "MON");

  const TriageLogger = await hre.ethers.getContractFactory("TriageLogger");
  const contract     = await TriageLogger.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("TriageLogger deployed to:", address);
  console.log("Add to .env → MONAD_CONTRACT_ADDR=" + address);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
