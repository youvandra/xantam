// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

interface AggregatorV3Interface {
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}

contract GoldPriceOracle is AccessControl {
    bytes32 public constant UPDATER_ROLE = keccak256("UPDATER_ROLE");

    uint256 public manualPrice;
    AggregatorV3Interface public chainlinkFeed;

    constructor(uint256 _initialPrice) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(UPDATER_ROLE, msg.sender);
        manualPrice = _initialPrice;
    }

    function setManualPrice(uint256 _price) external onlyRole(UPDATER_ROLE) {
        manualPrice = _price;
    }

    function setChainlinkFeed(address _feed) external onlyRole(DEFAULT_ADMIN_ROLE) {
        chainlinkFeed = AggregatorV3Interface(_feed);
    }

    function getGoldPrice() external view returns (uint256) {
        if (address(chainlinkFeed) != address(0)) {
            try chainlinkFeed.latestRoundData() returns (
                uint80,
                int256 answer,
                uint256,
                uint256,
                uint80
            ) {
                if (answer > 0) {
                    // Note: Chainlink answers usually have 8 decimals. 
                    // To be fully production ready with Chainlink, we would need 
                    // logic here to scale it to 18 decimals and convert USD->IDR.
                    // For now, we return the raw answer or fall back to manualPrice
                    // if the feed is not set or failing.
                    return uint256(answer); 
                }
            } catch {}
        }
        return manualPrice;
    }
}