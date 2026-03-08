// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RentEscrow {
    address public tenant; // buyer
    address public landlord; // seller
    uint public amount; // rent amount
    bool public confirmed; // delivery confirmed (lease accepted)
    uint public deadline; // timestamp for refund
    uint public yieldPercent; // like 3%

    // rating system
    uint public totalRating;
    uint public numRatings;

    // events
    event Deposited(address indexed from, uint value);
    event Confirmed();
    event Released(uint value, uint yield);
    event Refunded(uint value);
    event Rated(address indexed by, uint score);

    constructor(
        address _landlord,
        uint _durationSeconds,
        uint _yieldPercent
    ) payable {
        tenant = msg.sender;
        landlord = _landlord;
        amount = msg.value;
        yieldPercent = _yieldPercent;
        deadline = block.timestamp + _durationSeconds;
        require(amount > 0, "Send ETH to escrow");
        emit Deposited(msg.sender, amount);
    }

    function deposit() public payable {
        require(msg.sender == tenant, "Only tenant can deposit");
        require(msg.value == amount, "Incorrect deposit amount");
        emit Deposited(msg.sender, msg.value);
    }

    function confirmLease() public {
        require(msg.sender == tenant, "Only tenant can confirm lease");
        confirmed = true;
        emit Confirmed();
    }

    function releaseFunds() public {
        require(confirmed, "Lease not confirmed");
        uint yieldAmount = (amount * yieldPercent) / 100;
        payable(landlord).transfer(amount);
        payable(tenant).transfer(yieldAmount);
        emit Released(amount, yieldAmount);
    }

    function refund() public {
        require(msg.sender == tenant, "Only tenant can refund");
        require(!confirmed, "Already confirmed");
        require(block.timestamp >= deadline, "Too early to refund");
        payable(tenant).transfer(amount);
        emit Refunded(amount);
    }

    // rate landlord
    function rateLandlord(uint score) public {
        require(msg.sender == tenant, "Only tenant can rate");
        require(confirmed, "Lease not confirmed");
        require(score >= 1 && score <= 5, "Score 1-5");
        totalRating += score;
        numRatings += 1;
        emit Rated(msg.sender, score);
    }

    function getAverageRating() public view returns (uint) {
        if (numRatings == 0) return 0;
        return totalRating / numRatings;
    }

    function getNumRatings() public view returns (uint) {
        return numRatings;
    }
}
