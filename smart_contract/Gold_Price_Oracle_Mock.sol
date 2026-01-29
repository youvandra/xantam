// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MockGoldOracle is Ownable {
    uint256 public goldPrice; // IDRX per gram (18 decimals)

    constructor(uint256 _price) Ownable(msg.sender) {
        goldPrice = _price;
    }

    function setGoldPrice(uint256 _price) external onlyOwner {
        goldPrice = _price;
    }

    function getGoldPrice() external view returns (uint256) {
        return goldPrice;
    }
}
