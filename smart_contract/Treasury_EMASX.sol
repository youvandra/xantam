// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Treasury is Ownable {
    IERC20 public idrx;

    constructor(address _idrx) Ownable(msg.sender) {
        idrx = IERC20(_idrx);
    }

    function withdraw(address to, uint256 amount) external onlyOwner {
        idrx.transfer(to, amount);
    }
}
