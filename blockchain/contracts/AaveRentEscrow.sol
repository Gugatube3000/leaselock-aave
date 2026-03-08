// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IPool.sol";
import "./interfaces/IWETH.sol";

/// @title AaveRentEscrow — Rent escrow with real Aave V3 yield
/// @notice Tenant deposits ETH which is wrapped to WETH and supplied to Aave.
///         Yield accrues as aWETH. On release, principal goes to landlord and
///         yield bonus goes to tenant. On refund, tenant gets everything back.
contract AaveRentEscrow {
    address public tenant;
    address public landlord;
    uint256 public depositAmount;     // original ETH deposited
    bool    public confirmed;         // lease confirmed
    uint256 public deadline;          // refund deadline timestamp

    // Aave V3 integration
    IPool   public immutable aavePool;
    IWETH   public immutable weth;
    address public immutable aToken;  // aWETH token address

    // Rating system
    uint256 public totalRating;
    uint256 public numRatings;

    // Events
    event Deposited(address indexed from, uint256 value);
    event SuppliedToAave(uint256 amount);
    event Confirmed();
    event Released(uint256 landlordAmount, uint256 tenantYield);
    event Refunded(uint256 value);
    event Rated(address indexed by, uint256 score);

    /// @param _landlord Address of the landlord
    /// @param _durationSeconds Duration until refund is allowed
    /// @param _aavePool Aave V3 Pool contract address
    /// @param _weth WETH contract address
    /// @param _aToken aWETH token address (Aave's interest-bearing WETH)
    constructor(
        address _landlord,
        uint256 _durationSeconds,
        address _aavePool,
        address _weth,
        address _aToken
    ) payable {
        require(msg.value > 0, "Send ETH to escrow");

        tenant       = msg.sender;
        landlord     = _landlord;
        depositAmount = msg.value;
        deadline     = block.timestamp + _durationSeconds;
        aavePool     = IPool(_aavePool);
        weth         = IWETH(_weth);
        aToken       = _aToken;

        emit Deposited(msg.sender, msg.value);

        // Wrap ETH -> WETH
        weth.deposit{value: msg.value}();

        // Approve Aave Pool to spend WETH
        weth.approve(_aavePool, msg.value);

        // Supply WETH to Aave V3 (aWETH minted to this contract)
        aavePool.supply(_weth, msg.value, address(this), 0);

        emit SuppliedToAave(msg.value);
    }

    /// @notice Returns the yield accrued so far (aWETH balance - original deposit)
    function getAccruedYield() public view returns (uint256) {
        uint256 aTokenBalance = IWETH(aToken).balanceOf(address(this));
        if (aTokenBalance <= depositAmount) return 0;
        return aTokenBalance - depositAmount;
    }

    /// @notice Returns total aToken balance (principal + yield)
    function getTotalAaveBalance() public view returns (uint256) {
        return IWETH(aToken).balanceOf(address(this));
    }

    function confirmLease() public {
        require(msg.sender == tenant, "Only tenant can confirm lease");
        confirmed = true;
        emit Confirmed();
    }

    /// @notice Withdraw from Aave and distribute: principal to landlord, yield to tenant
    function releaseFunds() public {
        require(confirmed, "Lease not confirmed");

        // Withdraw everything from Aave (returns WETH)
        uint256 totalBalance = IWETH(aToken).balanceOf(address(this));
        IWETH(aToken).approve(address(aavePool), totalBalance);
        uint256 withdrawn = aavePool.withdraw(address(weth), type(uint256).max, address(this));

        // Calculate yield
        uint256 yieldAmount = withdrawn > depositAmount ? withdrawn - depositAmount : 0;
        uint256 landlordAmount = depositAmount;

        // Unwrap WETH -> ETH
        weth.withdraw(withdrawn);

        // Send principal to landlord, yield to tenant
        payable(landlord).transfer(landlordAmount);
        if (yieldAmount > 0) {
            payable(tenant).transfer(yieldAmount);
        }

        emit Released(landlordAmount, yieldAmount);
    }

    /// @notice Refund tenant if lease not confirmed and deadline passed
    function refund() public {
        require(msg.sender == tenant, "Only tenant can refund");
        require(!confirmed, "Already confirmed");
        require(block.timestamp >= deadline, "Too early to refund");

        // Withdraw everything from Aave
        uint256 totalBalance = IWETH(aToken).balanceOf(address(this));
        IWETH(aToken).approve(address(aavePool), totalBalance);
        uint256 withdrawn = aavePool.withdraw(address(weth), type(uint256).max, address(this));

        // Unwrap WETH -> ETH
        weth.withdraw(withdrawn);

        // Return everything (principal + yield) to tenant
        payable(tenant).transfer(withdrawn);

        emit Refunded(withdrawn);
    }

    /// @notice Rate the landlord (1-5 scale)
    function rateLandlord(uint256 score) public {
        require(msg.sender == tenant, "Only tenant can rate");
        require(confirmed, "Lease not confirmed");
        require(score >= 1 && score <= 5, "Score 1-5");
        totalRating += score;
        numRatings += 1;
        emit Rated(msg.sender, score);
    }

    function getAverageRating() public view returns (uint256) {
        if (numRatings == 0) return 0;
        return (totalRating * 100) / numRatings;
    }

    function getNumRatings() public view returns (uint256) {
        return numRatings;
    }

    /// @notice Accept ETH (needed for WETH.withdraw)
    receive() external payable {}
}
