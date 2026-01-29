const { ethers } = require("ethers");

async function main() {
    // Function selectors
    const f1 = ethers.id("swapIDRXToEMASX(uint256)").slice(0, 10);
    const f2 = ethers.id("swapEMASXToIDRX(uint256)").slice(0, 10);
    
    console.log("swapIDRXToEMASX:", f1);
    console.log("swapEMASXToIDRX:", f2);

    // Custom Error selectors
    // Common errors
    const e1 = ethers.id("AccessControlUnauthorizedAccount(address,bytes32)").slice(0, 10);
    const e2 = ethers.id("OwnableUnauthorizedAccount(address)").slice(0, 10);
    const e3 = ethers.id("ERC20InsufficientBalance(address,uint256,uint256)").slice(0, 10);
    const e4 = ethers.id("ERC20InsufficientAllowance(address,uint256,uint256)").slice(0, 10);

    console.log("AccessControlUnauthorizedAccount:", e1);
    console.log("OwnableUnauthorizedAccount:", e2);
    console.log("ERC20InsufficientBalance:", e3);
    console.log("ERC20InsufficientAllowance:", e4);
    
    // Check against 0xfb8f41b2
    // Check against 0x36de77ba (Transaction data selector)
}

main();