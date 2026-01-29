const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy MockIDRX
  const MockIDRX = await hre.ethers.getContractFactory("MockIDRX");
  const idrx = await MockIDRX.deploy();
  await idrx.waitForDeployment();
  const idrxAddress = await idrx.getAddress();
  console.log("MockIDRX deployed to:", idrxAddress);

  // 2. Deploy EMASX Token
  const EMASX = await hre.ethers.getContractFactory("EMASX");
  const emasx = await EMASX.deploy();
  await emasx.waitForDeployment();
  const emasxAddress = await emasx.getAddress();
  console.log("EMASX deployed to:", emasxAddress);

  // 3. Deploy GoldPriceOracle
  // Initial price: 2,922,500 IDRX per gram
  // Price = 2,922,500 * 1e18 (since IDRX has 18 decimals and we want cost per gram unit)
  const initialPrice = hre.ethers.parseUnits("2922500", 18);
  const GoldPriceOracle = await hre.ethers.getContractFactory("GoldPriceOracle");
  const oracle = await GoldPriceOracle.deploy(initialPrice);
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  console.log("GoldPriceOracle deployed to:", oracleAddress);

  // 4. Deploy Treasury
  const Treasury = await hre.ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy(idrxAddress);
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("Treasury deployed to:", treasuryAddress);

  // 5. Deploy EMASXSwap
  const EMASXSwap = await hre.ethers.getContractFactory("EMASXSwap");
  const swap = await EMASXSwap.deploy(idrxAddress, emasxAddress, oracleAddress, treasuryAddress);
  await swap.waitForDeployment();
  const swapAddress = await swap.getAddress();
  console.log("EMASXSwap deployed to:", swapAddress);

  // 6. Deploy EMASXLending
  const EMASXLending = await hre.ethers.getContractFactory("EMASXLending");
  const lending = await EMASXLending.deploy(idrxAddress, emasxAddress, oracleAddress);
  await lending.waitForDeployment();
  const lendingAddress = await lending.getAddress();
  console.log("EMASXLending deployed to:", lendingAddress);

  // 7. Deploy GoldClaimRegistry
  const GoldClaimRegistry = await hre.ethers.getContractFactory("GoldClaimRegistry");
  const claim = await GoldClaimRegistry.deploy(emasxAddress);
  await claim.waitForDeployment();
  const claimAddress = await claim.getAddress();
  console.log("GoldClaimRegistry deployed to:", claimAddress);

  // 8. Setup Permissions (Roles)
  const MINTER_ROLE = await emasx.MINTER_ROLE();
  const BURNER_ROLE = await emasx.BURNER_ROLE();

  console.log("Setting up permissions...");
  
  // Swap contract needs to MINT EMASX (IDRX -> EMASX)
  await emasx.grantRole(MINTER_ROLE, swapAddress);
  console.log("Granted MINTER_ROLE to Swap");

  // Swap contract needs to BURN EMASX (EMASX -> IDRX)
  await emasx.grantRole(BURNER_ROLE, swapAddress);
  console.log("Granted BURNER_ROLE to Swap");

  // Lending contract needs to BURN EMASX (Liquidate)
  // Also Lending contract transfers EMASX, but doesn't mint.
  await emasx.grantRole(BURNER_ROLE, lendingAddress);
  console.log("Granted BURNER_ROLE to Lending");

  // Claim contract needs to BURN EMASX (Claim physical gold)
  await emasx.grantRole(BURNER_ROLE, claimAddress);
  console.log("Granted BURNER_ROLE to Claim");

  // 9. Fund Treasury with some IDRX (for selling gold/swapping EMASX to IDRX)
  // Deployer has 1B IDRX from MockIDRX constructor
  // Transfer 100M to Treasury
  const fundAmount = hre.ethers.parseUnits("100000000", 18);
  await idrx.transfer(treasuryAddress, fundAmount);
  console.log("Funded Treasury with 100M IDRX");

  // 10. Fund Deployer with some EMASX (optional, for testing)
  // Mint 1000 EMASX to deployer
  // Deployer is admin, can grant itself minter role if needed, but we can use Swap to get EMASX.
  // Or simply grant deployer MINTER_ROLE temporarily.
  await emasx.grantRole(MINTER_ROLE, deployer.address);
  await emasx.mint(deployer.address, hre.ethers.parseUnits("1000", 18));
  console.log("Minted 1000 EMASX to deployer");

  // 11. Save addresses and ABI to frontend
  const addresses = {
    MockIDRX: idrxAddress,
    EMASX: emasxAddress,
    GoldPriceOracle: oracleAddress,
    Treasury: treasuryAddress,
    EMASXSwap: swapAddress,
    EMASXLending: lendingAddress,
    GoldClaimRegistry: claimAddress
  };

  const abisDir = path.join(__dirname, "../src/abis");
  if (!fs.existsSync(abisDir)) {
    fs.mkdirSync(abisDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(abisDir, "contract-address.json"),
    JSON.stringify(addresses, null, 2)
  );

  // Helper to save ABI
  const saveAbi = (name, contract) => {
    const artifact = artifacts.readArtifactSync(name);
    fs.writeFileSync(
      path.join(abisDir, `${name}.json`),
      JSON.stringify(artifact, null, 2)
    );
  };

  saveAbi("MockIDRX", idrx);
  saveAbi("EMASX", emasx);
  saveAbi("GoldPriceOracle", oracle);
  saveAbi("Treasury", treasury);
  saveAbi("EMASXSwap", swap);
  saveAbi("EMASXLending", lending);
  saveAbi("GoldClaimRegistry", claim);

  console.log("Addresses and ABIs saved to src/abis/");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
