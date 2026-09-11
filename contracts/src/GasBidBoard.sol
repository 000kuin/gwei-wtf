// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title GasBidBoard
/// @notice Public on-chain bid board for Robinhood Chain (Chain ID: 4663).
///         Users post "I'll pay X gwei for inclusion before block Y."
///         Block builders and traders read this to understand demand.
///         All bids are public, on-chain, and immutable once posted.
///         Posted on RH Gas — the definitive gas tracker for Robinhood Chain.
contract GasBidBoard {

    struct Bid {
        address bidder;
        uint64  maxFeeGwei;      // max fee willing to pay (in gwei)
        uint64  targetBlock;     // must be included before this block
        uint64  postedAt;        // block number when bid was posted
        uint128 value;           // ETH deposited as signal of seriousness (refundable)
        bool    fulfilled;       // marked by bidder when included
        bool    expired;         // marked when targetBlock has passed
        string  note;            // optional public note (max 128 chars)
    }

    Bid[]   public bids;
    uint256 public totalBids;
    uint256 public totalFulfilled;

    // Minimum ETH deposit to post a bid (prevents spam, fully refundable)
    uint256 public constant MIN_DEPOSIT = 0.0001 ether;

    event BidPosted(
        uint256 indexed bidId,
        address indexed bidder,
        uint64  maxFeeGwei,
        uint64  targetBlock,
        uint128 value,
        string  note
    );

    event BidFulfilled(uint256 indexed bidId, address indexed bidder);
    event BidWithdrawn(uint256 indexed bidId, address indexed bidder);

    error InsufficientDeposit();
    error NotBidder();
    error BidAlreadyClosed();
    error TargetBlockInPast();
    error NotePastMaxLength();
    error TransferFailed();

    function postBid(
        uint64 maxFeeGwei,
        uint64 targetBlock,
        string calldata note
    ) external payable returns (uint256 bidId) {
        if (msg.value < MIN_DEPOSIT)            revert InsufficientDeposit();
        if (targetBlock <= block.number)         revert TargetBlockInPast();
        if (bytes(note).length > 128)           revert NotePastMaxLength();

        bidId = bids.length;
        bids.push(Bid({
            bidder:      msg.sender,
            maxFeeGwei:  maxFeeGwei,
            targetBlock: targetBlock,
            postedAt:    uint64(block.number),
            value:       uint128(msg.value),
            fulfilled:   false,
            expired:     false,
            note:        note,
        }));

        totalBids++;

        emit BidPosted(bidId, msg.sender, maxFeeGwei, targetBlock, uint128(msg.value), note);
    }

    /// @notice Mark a bid as fulfilled (call after your tx is included).
    ///         Refunds the deposit.
    function markFulfilled(uint256 bidId) external {
        Bid storage bid = bids[bidId];
        if (bid.bidder != msg.sender)            revert NotBidder();
        if (bid.fulfilled || bid.expired)        revert BidAlreadyClosed();

        bid.fulfilled = true;
        totalFulfilled++;

        (bool ok,) = msg.sender.call{value: bid.value}("");
        if (!ok) revert TransferFailed();

        emit BidFulfilled(bidId, msg.sender);
    }

    /// @notice Withdraw deposit from an expired bid.
    function withdraw(uint256 bidId) external {
        Bid storage bid = bids[bidId];
        if (bid.bidder != msg.sender)            revert NotBidder();
        if (bid.fulfilled || bid.expired)        revert BidAlreadyClosed();
        if (block.number <= bid.targetBlock)     revert BidAlreadyClosed();

        bid.expired = true;

        (bool ok,) = msg.sender.call{value: bid.value}("");
        if (!ok) revert TransferFailed();

        emit BidWithdrawn(bidId, msg.sender);
    }

    function bidCount() external view returns (uint256) {
        return bids.length;
    }

    /// @notice Get the N most recent active bids
    function getActiveBids(uint256 limit) external view returns (Bid[] memory result, uint256[] memory ids) {
        uint256 count = 0;
        uint256 len   = bids.length;

        // Count active first
        for (uint256 i = len; i > 0 && count < limit; i--) {
            Bid storage b = bids[i - 1];
            if (!b.fulfilled && !b.expired && b.targetBlock > block.number) count++;
        }

        result = new Bid[](count);
        ids    = new uint256[](count);
        uint256 j = 0;

        for (uint256 i = len; i > 0 && j < count; i--) {
            Bid storage b = bids[i - 1];
            if (!b.fulfilled && !b.expired && b.targetBlock > block.number) {
                result[j] = b;
                ids[j]    = i - 1;
                j++;
            }
        }
    }
}
