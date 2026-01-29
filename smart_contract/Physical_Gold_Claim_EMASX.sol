// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IEMASX {
    function burn(address from, uint256 amount) external;
}

contract GoldClaimRegistry {
    IEMASX public emasx;

    event GoldClaimed(
        address indexed user,
        uint256 grams,
        uint256 timestamp
    );

    constructor(address _emasx) {
        emasx = IEMASX(_emasx);
    }

    function claim(uint256 grams) external {
        emasx.burn(msg.sender, grams);
        emit GoldClaimed(msg.sender, grams, block.timestamp);
    }
}
