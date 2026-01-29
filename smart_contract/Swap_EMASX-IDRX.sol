// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IEMASX {
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
}

interface IOracle {
    function getGoldPrice() external view returns (uint256);
}

contract EMASXSwap {
    IERC20 public idrx;
    IEMASX public emasx;
    IOracle public oracle;

    uint256 public feeBps = 15; // 0.15%
    address public treasury;

    constructor(
        address _idrx,
        address _emasx,
        address _oracle,
        address _treasury
    ) {
        idrx = IERC20(_idrx);
        emasx = IEMASX(_emasx);
        oracle = IOracle(_oracle);
        treasury = _treasury;
    }

    function swapIDRXToEMASX(uint256 idrxAmount) external {
        uint256 price = oracle.getGoldPrice();
        uint256 fee = (idrxAmount * feeBps) / 10_000;
        uint256 net = idrxAmount - fee;

        uint256 emasxAmount = (net * 1e18) / price;

        idrx.transferFrom(msg.sender, treasury, idrxAmount);
        emasx.mint(msg.sender, emasxAmount);
    }

    function swapEMASXToIDRX(uint256 emasxAmount) external {
        uint256 price = oracle.getGoldPrice();
        uint256 idrxAmount = (emasxAmount * price) / 1e18;

        emasx.burn(msg.sender, emasxAmount);
        idrx.transferFrom(treasury, msg.sender, idrxAmount);
    }
}
