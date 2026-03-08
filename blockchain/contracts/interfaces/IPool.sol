// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Minimal Aave V3 Pool interface for supply/withdraw
interface IPool {
    /// @notice Supplies an amount of underlying asset into the reserve
    /// @param asset The address of the underlying asset to supply
    /// @param amount The amount to be supplied
    /// @param onBehalfOf The address that will receive the aTokens
    /// @param referralCode Referral code (0 for none)
    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external;

    /// @notice Withdraws an amount of underlying asset from the reserve
    /// @param asset The address of the underlying asset to withdraw
    /// @param amount The amount to withdraw (use type(uint256).max for full balance)
    /// @param to The address that will receive the underlying
    /// @return The final amount withdrawn
    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external returns (uint256);
}
