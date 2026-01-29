// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IEMASX is IERC20 {
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
}

interface IOracle {
    function getGoldPrice() external view returns (uint256);
}

contract EMASXLending {
    IERC20 public idrx;
    IEMASX public emasx;
    IOracle public oracle;

    uint256 public constant LTV = 60;

    struct Position {
        uint256 collateral;
        uint256 debt;
    }

    mapping(address => Position) public positions;

    constructor(address _idrx, address _emasx, address _oracle) {
        idrx = IERC20(_idrx);
        emasx = IEMASX(_emasx);
        oracle = IOracle(_oracle);
    }

    function deposit(uint256 amount) external {
        emasx.transferFrom(msg.sender, address(this), amount);
        positions[msg.sender].collateral += amount;
    }

    function borrow(uint256 amount) external {
        Position storage p = positions[msg.sender];
        uint256 price = oracle.getGoldPrice();
        uint256 maxBorrow =
            (p.collateral * price * LTV) / 100 / 1e18;

        require(p.debt + amount <= maxBorrow, "LTV exceeded");

        p.debt += amount;
        idrx.transfer(msg.sender, amount);
    }

    function repay(uint256 amount) external {
        Position storage p = positions[msg.sender];
        idrx.transferFrom(msg.sender, address(this), amount);
        p.debt -= amount;
    }

    function withdraw(uint256 amount) external {
        Position storage p = positions[msg.sender];
        uint256 price = oracle.getGoldPrice();

        uint256 remainingCollateral = p.collateral - amount;
        uint256 maxBorrow =
            (remainingCollateral * price * LTV) / 100 / 1e18;

        require(p.debt <= maxBorrow, "Unsafe");

        p.collateral = remainingCollateral;
        emasx.transfer(msg.sender, amount);
    }

    function liquidate(address user) external {
        Position storage p = positions[user];
        uint256 price = oracle.getGoldPrice();
        uint256 maxBorrow =
            (p.collateral * price * LTV) / 100 / 1e18;

        require(p.debt > maxBorrow, "Healthy");

        emasx.burn(address(this), p.collateral);
        p.collateral = 0;
        p.debt = 0;
    }
}
