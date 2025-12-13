// SPDX-License-Identifier: MIT
pragma solidity >=0.4.16 >=0.6.2 ^0.8.20 ^0.8.24;

// lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol

// OpenZeppelin Contracts (last updated v5.4.0) (utils/introspection/IERC165.sol)

/**
 * @dev Interface of the ERC-165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[ERC].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[ERC section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

// lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol

// OpenZeppelin Contracts (last updated v5.4.0) (token/ERC20/IERC20.sol)

/**
 * @dev Interface of the ERC-20 standard as defined in the ERC.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

// lib/openzeppelin-contracts/contracts/utils/StorageSlot.sol

// OpenZeppelin Contracts (last updated v5.1.0) (utils/StorageSlot.sol)
// This file was procedurally generated from scripts/generate/templates/StorageSlot.js.

/**
 * @dev Library for reading and writing primitive types to specific storage slots.
 *
 * Storage slots are often used to avoid storage conflict when dealing with upgradeable contracts.
 * This library helps with reading and writing to such slots without the need for inline assembly.
 *
 * The functions in this library return Slot structs that contain a `value` member that can be used to read or write.
 *
 * Example usage to set ERC-1967 implementation slot:
 * ```solidity
 * contract ERC1967 {
 *     // Define the slot. Alternatively, use the SlotDerivation library to derive the slot.
 *     bytes32 internal constant _IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
 *
 *     function _getImplementation() internal view returns (address) {
 *         return StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value;
 *     }
 *
 *     function _setImplementation(address newImplementation) internal {
 *         require(newImplementation.code.length > 0);
 *         StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value = newImplementation;
 *     }
 * }
 * ```
 *
 * TIP: Consider using this library along with {SlotDerivation}.
 */
library StorageSlot {
    struct AddressSlot {
        address value;
    }

    struct BooleanSlot {
        bool value;
    }

    struct Bytes32Slot {
        bytes32 value;
    }

    struct Uint256Slot {
        uint256 value;
    }

    struct Int256Slot {
        int256 value;
    }

    struct StringSlot {
        string value;
    }

    struct BytesSlot {
        bytes value;
    }

    /**
     * @dev Returns an `AddressSlot` with member `value` located at `slot`.
     */
    function getAddressSlot(bytes32 slot) internal pure returns (AddressSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `BooleanSlot` with member `value` located at `slot`.
     */
    function getBooleanSlot(bytes32 slot) internal pure returns (BooleanSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `Bytes32Slot` with member `value` located at `slot`.
     */
    function getBytes32Slot(bytes32 slot) internal pure returns (Bytes32Slot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `Uint256Slot` with member `value` located at `slot`.
     */
    function getUint256Slot(bytes32 slot) internal pure returns (Uint256Slot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `Int256Slot` with member `value` located at `slot`.
     */
    function getInt256Slot(bytes32 slot) internal pure returns (Int256Slot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `StringSlot` with member `value` located at `slot`.
     */
    function getStringSlot(bytes32 slot) internal pure returns (StringSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns an `StringSlot` representation of the string storage pointer `store`.
     */
    function getStringSlot(string storage store) internal pure returns (StringSlot storage r) {
        assembly ("memory-safe") {
            r.slot := store.slot
        }
    }

    /**
     * @dev Returns a `BytesSlot` with member `value` located at `slot`.
     */
    function getBytesSlot(bytes32 slot) internal pure returns (BytesSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns an `BytesSlot` representation of the bytes storage pointer `store`.
     */
    function getBytesSlot(bytes storage store) internal pure returns (BytesSlot storage r) {
        assembly ("memory-safe") {
            r.slot := store.slot
        }
    }
}

// lib/openzeppelin-contracts/contracts/interfaces/IERC165.sol

// OpenZeppelin Contracts (last updated v5.4.0) (interfaces/IERC165.sol)

// lib/openzeppelin-contracts/contracts/interfaces/IERC20.sol

// OpenZeppelin Contracts (last updated v5.4.0) (interfaces/IERC20.sol)

// lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol

// OpenZeppelin Contracts (last updated v5.5.0) (utils/ReentrancyGuard.sol)

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If EIP-1153 (transient storage) is available on the chain you're deploying at,
 * consider using {ReentrancyGuardTransient} instead.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 *
 * IMPORTANT: Deprecated. This storage-based reentrancy guard will be removed and replaced
 * by the {ReentrancyGuardTransient} variant in v6.0.
 *
 * @custom:stateless
 */
abstract contract ReentrancyGuard {
    using StorageSlot for bytes32;

    // keccak256(abi.encode(uint256(keccak256("openzeppelin.storage.ReentrancyGuard")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant REENTRANCY_GUARD_STORAGE =
        0x9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00;

    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    constructor() {
        _reentrancyGuardStorageSlot().getUint256Slot().value = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    /**
     * @dev A `view` only version of {nonReentrant}. Use to block view functions
     * from being called, preventing reading from inconsistent contract state.
     *
     * CAUTION: This is a "view" modifier and does not change the reentrancy
     * status. Use it only on view functions. For payable or non-payable functions,
     * use the standard {nonReentrant} modifier instead.
     */
    modifier nonReentrantView() {
        _nonReentrantBeforeView();
        _;
    }

    function _nonReentrantBeforeView() private view {
        if (_reentrancyGuardEntered()) {
            revert ReentrancyGuardReentrantCall();
        }
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        _nonReentrantBeforeView();

        // Any calls to nonReentrant after this point will fail
        _reentrancyGuardStorageSlot().getUint256Slot().value = ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _reentrancyGuardStorageSlot().getUint256Slot().value = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _reentrancyGuardStorageSlot().getUint256Slot().value == ENTERED;
    }

    function _reentrancyGuardStorageSlot() internal pure virtual returns (bytes32) {
        return REENTRANCY_GUARD_STORAGE;
    }
}

// lib/openzeppelin-contracts/contracts/interfaces/IERC1363.sol

// OpenZeppelin Contracts (last updated v5.4.0) (interfaces/IERC1363.sol)

/**
 * @title IERC1363
 * @dev Interface of the ERC-1363 standard as defined in the https://eips.ethereum.org/EIPS/eip-1363[ERC-1363].
 *
 * Defines an extension interface for ERC-20 tokens that supports executing code on a recipient contract
 * after `transfer` or `transferFrom`, or code on a spender contract after `approve`, in a single transaction.
 */
interface IERC1363 is IERC20, IERC165 {
    /*
     * Note: the ERC-165 identifier for this interface is 0xb0202a11.
     * 0xb0202a11 ===
     *   bytes4(keccak256('transferAndCall(address,uint256)')) ^
     *   bytes4(keccak256('transferAndCall(address,uint256,bytes)')) ^
     *   bytes4(keccak256('transferFromAndCall(address,address,uint256)')) ^
     *   bytes4(keccak256('transferFromAndCall(address,address,uint256,bytes)')) ^
     *   bytes4(keccak256('approveAndCall(address,uint256)')) ^
     *   bytes4(keccak256('approveAndCall(address,uint256,bytes)'))
     */

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferAndCall(address to, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @param data Additional data with no specified format, sent in call to `to`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferAndCall(address to, uint256 value, bytes calldata data) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the allowance mechanism
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param from The address which you want to send tokens from.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferFromAndCall(address from, address to, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the allowance mechanism
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param from The address which you want to send tokens from.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @param data Additional data with no specified format, sent in call to `to`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferFromAndCall(address from, address to, uint256 value, bytes calldata data) external returns (bool);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens and then calls {IERC1363Spender-onApprovalReceived} on `spender`.
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function approveAndCall(address spender, uint256 value) external returns (bool);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens and then calls {IERC1363Spender-onApprovalReceived} on `spender`.
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     * @param data Additional data with no specified format, sent in call to `spender`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function approveAndCall(address spender, uint256 value, bytes calldata data) external returns (bool);
}

// lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol

// OpenZeppelin Contracts (last updated v5.5.0) (token/ERC20/utils/SafeERC20.sol)

/**
 * @title SafeERC20
 * @dev Wrappers around ERC-20 operations that throw on failure (when the token
 * contract returns false). Tokens that return no value (and instead revert or
 * throw on failure) are also supported, non-reverting calls are assumed to be
 * successful.
 * To use this library you can add a `using SafeERC20 for IERC20;` statement to your contract,
 * which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
 */
library SafeERC20 {
    /**
     * @dev An operation with an ERC-20 token failed.
     */
    error SafeERC20FailedOperation(address token);

    /**
     * @dev Indicates a failed `decreaseAllowance` request.
     */
    error SafeERC20FailedDecreaseAllowance(address spender, uint256 currentAllowance, uint256 requestedDecrease);

    /**
     * @dev Transfer `value` amount of `token` from the calling contract to `to`. If `token` returns no value,
     * non-reverting calls are assumed to be successful.
     */
    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        if (!_safeTransfer(token, to, value, true)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Transfer `value` amount of `token` from `from` to `to`, spending the approval given by `from` to the
     * calling contract. If `token` returns no value, non-reverting calls are assumed to be successful.
     */
    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        if (!_safeTransferFrom(token, from, to, value, true)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Variant of {safeTransfer} that returns a bool instead of reverting if the operation is not successful.
     */
    function trySafeTransfer(IERC20 token, address to, uint256 value) internal returns (bool) {
        return _safeTransfer(token, to, value, false);
    }

    /**
     * @dev Variant of {safeTransferFrom} that returns a bool instead of reverting if the operation is not successful.
     */
    function trySafeTransferFrom(IERC20 token, address from, address to, uint256 value) internal returns (bool) {
        return _safeTransferFrom(token, from, to, value, false);
    }

    /**
     * @dev Increase the calling contract's allowance toward `spender` by `value`. If `token` returns no value,
     * non-reverting calls are assumed to be successful.
     *
     * IMPORTANT: If the token implements ERC-7674 (ERC-20 with temporary allowance), and if the "client"
     * smart contract uses ERC-7674 to set temporary allowances, then the "client" smart contract should avoid using
     * this function. Performing a {safeIncreaseAllowance} or {safeDecreaseAllowance} operation on a token contract
     * that has a non-zero temporary allowance (for that particular owner-spender) will result in unexpected behavior.
     */
    function safeIncreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 oldAllowance = token.allowance(address(this), spender);
        forceApprove(token, spender, oldAllowance + value);
    }

    /**
     * @dev Decrease the calling contract's allowance toward `spender` by `requestedDecrease`. If `token` returns no
     * value, non-reverting calls are assumed to be successful.
     *
     * IMPORTANT: If the token implements ERC-7674 (ERC-20 with temporary allowance), and if the "client"
     * smart contract uses ERC-7674 to set temporary allowances, then the "client" smart contract should avoid using
     * this function. Performing a {safeIncreaseAllowance} or {safeDecreaseAllowance} operation on a token contract
     * that has a non-zero temporary allowance (for that particular owner-spender) will result in unexpected behavior.
     */
    function safeDecreaseAllowance(IERC20 token, address spender, uint256 requestedDecrease) internal {
        unchecked {
            uint256 currentAllowance = token.allowance(address(this), spender);
            if (currentAllowance < requestedDecrease) {
                revert SafeERC20FailedDecreaseAllowance(spender, currentAllowance, requestedDecrease);
            }
            forceApprove(token, spender, currentAllowance - requestedDecrease);
        }
    }

    /**
     * @dev Set the calling contract's allowance toward `spender` to `value`. If `token` returns no value,
     * non-reverting calls are assumed to be successful. Meant to be used with tokens that require the approval
     * to be set to zero before setting it to a non-zero value, such as USDT.
     *
     * NOTE: If the token implements ERC-7674, this function will not modify any temporary allowance. This function
     * only sets the "standard" allowance. Any temporary allowance will remain active, in addition to the value being
     * set here.
     */
    function forceApprove(IERC20 token, address spender, uint256 value) internal {
        if (!_safeApprove(token, spender, value, false)) {
            if (!_safeApprove(token, spender, 0, true)) revert SafeERC20FailedOperation(address(token));
            if (!_safeApprove(token, spender, value, true)) revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Performs an {ERC1363} transferAndCall, with a fallback to the simple {ERC20} transfer if the target has no
     * code. This can be used to implement an {ERC721}-like safe transfer that relies on {ERC1363} checks when
     * targeting contracts.
     *
     * Reverts if the returned value is other than `true`.
     */
    function transferAndCallRelaxed(IERC1363 token, address to, uint256 value, bytes memory data) internal {
        if (to.code.length == 0) {
            safeTransfer(token, to, value);
        } else if (!token.transferAndCall(to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Performs an {ERC1363} transferFromAndCall, with a fallback to the simple {ERC20} transferFrom if the target
     * has no code. This can be used to implement an {ERC721}-like safe transfer that relies on {ERC1363} checks when
     * targeting contracts.
     *
     * Reverts if the returned value is other than `true`.
     */
    function transferFromAndCallRelaxed(
        IERC1363 token,
        address from,
        address to,
        uint256 value,
        bytes memory data
    ) internal {
        if (to.code.length == 0) {
            safeTransferFrom(token, from, to, value);
        } else if (!token.transferFromAndCall(from, to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Performs an {ERC1363} approveAndCall, with a fallback to the simple {ERC20} approve if the target has no
     * code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * NOTE: When the recipient address (`to`) has no code (i.e. is an EOA), this function behaves as {forceApprove}.
     * Oppositely, when the recipient address (`to`) has code, this function only attempts to call {ERC1363-approveAndCall}
     * once without retrying, and relies on the returned value to be true.
     *
     * Reverts if the returned value is other than `true`.
     */
    function approveAndCallRelaxed(IERC1363 token, address to, uint256 value, bytes memory data) internal {
        if (to.code.length == 0) {
            forceApprove(token, to, value);
        } else if (!token.approveAndCall(to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Imitates a Solidity `token.transfer(to, value)` call, relaxing the requirement on the return value: the
     * return value is optional (but if data is returned, it must not be false).
     *
     * @param token The token targeted by the call.
     * @param to The recipient of the tokens
     * @param value The amount of token to transfer
     * @param bubble Behavior switch if the transfer call reverts: bubble the revert reason or return a false boolean.
     */
    function _safeTransfer(IERC20 token, address to, uint256 value, bool bubble) private returns (bool success) {
        bytes4 selector = IERC20.transfer.selector;

        assembly ("memory-safe") {
            let fmp := mload(0x40)
            mstore(0x00, selector)
            mstore(0x04, and(to, shr(96, not(0))))
            mstore(0x24, value)
            success := call(gas(), token, 0, 0x00, 0x44, 0x00, 0x20)
            // if call success and return is true, all is good.
            // otherwise (not success or return is not true), we need to perform further checks
            if iszero(and(success, eq(mload(0x00), 1))) {
                // if the call was a failure and bubble is enabled, bubble the error
                if and(iszero(success), bubble) {
                    returndatacopy(fmp, 0x00, returndatasize())
                    revert(fmp, returndatasize())
                }
                // if the return value is not true, then the call is only successful if:
                // - the token address has code
                // - the returndata is empty
                success := and(success, and(iszero(returndatasize()), gt(extcodesize(token), 0)))
            }
            mstore(0x40, fmp)
        }
    }

    /**
     * @dev Imitates a Solidity `token.transferFrom(from, to, value)` call, relaxing the requirement on the return
     * value: the return value is optional (but if data is returned, it must not be false).
     *
     * @param token The token targeted by the call.
     * @param from The sender of the tokens
     * @param to The recipient of the tokens
     * @param value The amount of token to transfer
     * @param bubble Behavior switch if the transfer call reverts: bubble the revert reason or return a false boolean.
     */
    function _safeTransferFrom(
        IERC20 token,
        address from,
        address to,
        uint256 value,
        bool bubble
    ) private returns (bool success) {
        bytes4 selector = IERC20.transferFrom.selector;

        assembly ("memory-safe") {
            let fmp := mload(0x40)
            mstore(0x00, selector)
            mstore(0x04, and(from, shr(96, not(0))))
            mstore(0x24, and(to, shr(96, not(0))))
            mstore(0x44, value)
            success := call(gas(), token, 0, 0x00, 0x64, 0x00, 0x20)
            // if call success and return is true, all is good.
            // otherwise (not success or return is not true), we need to perform further checks
            if iszero(and(success, eq(mload(0x00), 1))) {
                // if the call was a failure and bubble is enabled, bubble the error
                if and(iszero(success), bubble) {
                    returndatacopy(fmp, 0x00, returndatasize())
                    revert(fmp, returndatasize())
                }
                // if the return value is not true, then the call is only successful if:
                // - the token address has code
                // - the returndata is empty
                success := and(success, and(iszero(returndatasize()), gt(extcodesize(token), 0)))
            }
            mstore(0x40, fmp)
            mstore(0x60, 0)
        }
    }

    /**
     * @dev Imitates a Solidity `token.approve(spender, value)` call, relaxing the requirement on the return value:
     * the return value is optional (but if data is returned, it must not be false).
     *
     * @param token The token targeted by the call.
     * @param spender The spender of the tokens
     * @param value The amount of token to transfer
     * @param bubble Behavior switch if the transfer call reverts: bubble the revert reason or return a false boolean.
     */
    function _safeApprove(IERC20 token, address spender, uint256 value, bool bubble) private returns (bool success) {
        bytes4 selector = IERC20.approve.selector;

        assembly ("memory-safe") {
            let fmp := mload(0x40)
            mstore(0x00, selector)
            mstore(0x04, and(spender, shr(96, not(0))))
            mstore(0x24, value)
            success := call(gas(), token, 0, 0x00, 0x44, 0x00, 0x20)
            // if call success and return is true, all is good.
            // otherwise (not success or return is not true), we need to perform further checks
            if iszero(and(success, eq(mload(0x00), 1))) {
                // if the call was a failure and bubble is enabled, bubble the error
                if and(iszero(success), bubble) {
                    returndatacopy(fmp, 0x00, returndatasize())
                    revert(fmp, returndatasize())
                }
                // if the return value is not true, then the call is only successful if:
                // - the token address has code
                // - the returndata is empty
                success := and(success, and(iszero(returndatasize()), gt(extcodesize(token), 0)))
            }
            mstore(0x40, fmp)
        }
    }
}

// src/IPayReceiver.sol

/// @title IPayReceiver
/// @notice Receives cross-chain payments via Hyperlane and executes Story Protocol operations
/// @dev Deployed on Story Aeneid to handle license minting and derivative creation
contract IPayReceiver is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ Constants ============

    uint8 public constant OP_MINT_LICENSE = 1;
    uint8 public constant OP_CREATE_DERIVATIVE = 2;
    uint32 public constant AVALANCHE_DOMAIN = 43113;

    // ============ Immutables ============

    address public immutable mailbox;
    IERC20 public immutable usdc;
    IERC20 public immutable wip;
    address public immutable royaltyModule;
    address public immutable licensingModule;
    address public immutable pilTemplate;

    // ============ State Variables ============

    address public owner;
    bytes32 public trustedSender;
    uint256 public wipLiquidity;
    uint256 public usdcToWipRate; // Rate with 18 decimals (e.g., 10e18 = 1 USDC buys 10 WIP)
    bool public paused;

    // ============ Structs ============

    struct PaymentRecord {
        address payer;
        address ipId;
        uint256 licenseTermsId;
        uint256 usdcAmount;
        uint256 wipAmount;
        uint8 operationType;
        bool processed;
        uint256 timestamp;
    }

    // ============ Mappings ============

    mapping(bytes32 => PaymentRecord) public payments;

    // ============ Events ============

    event LicenseMinted(
        bytes32 indexed messageId,
        address indexed ipId,
        address indexed recipient,
        uint256 licenseTokenId,
        uint256 wipAmount
    );

    event DerivativeCreated(
        bytes32 indexed messageId,
        address indexed parentIpId,
        address indexed derivativeIpId,
        uint256 wipAmount
    );

    event PaymentFailed(bytes32 indexed messageId, uint8 operationType, string reason);

    event PaymentReceived(
        bytes32 indexed messageId,
        address indexed payer,
        address indexed ipId,
        uint256 usdcAmount,
        uint256 wipAmount
    );

    event WIPDeposited(address indexed depositor, uint256 amount, uint256 newLiquidity);
    event WIPWithdrawn(address indexed recipient, uint256 amount, uint256 newLiquidity);
    event USDCWithdrawn(address indexed recipient, uint256 amount);
    event ExchangeRateUpdated(uint256 oldRate, uint256 newRate);
    event TrustedSenderUpdated(bytes32 oldSender, bytes32 newSender);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event Paused(address indexed by);
    event Unpaused(address indexed by);

    // ============ Errors ============

    error OnlyOwner();
    error OnlyMailbox();
    error InvalidOrigin();
    error UntrustedSender();
    error InsufficientLiquidity();
    error InvalidAmount();
    error InvalidAddress();
    error InvalidRate();
    error ContractPaused();
    error PaymentAlreadyProcessed();
    error ZeroAddress();

    // ============ Modifiers ============

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    modifier onlyMailbox() {
        if (msg.sender != mailbox) revert OnlyMailbox();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }

    // ============ Constructor ============

    /// @notice Initialize the IPayReceiver contract
    /// @param _mailbox Hyperlane mailbox address on Story
    /// @param _usdc Bridged USDC token address on Story
    /// @param _wip WIP token address on Story
    /// @param _royaltyModule Story Protocol Royalty Module address
    /// @param _licensingModule Story Protocol Licensing Module address
    /// @param _pilTemplate PIL Template address for license terms
    /// @param _initialRate Initial USDC to WIP exchange rate (18 decimals)
    constructor(
        address _mailbox,
        address _usdc,
        address _wip,
        address _royaltyModule,
        address _licensingModule,
        address _pilTemplate,
        uint256 _initialRate
    ) {
        if (_mailbox == address(0)) revert ZeroAddress();
        if (_usdc == address(0)) revert ZeroAddress();
        if (_wip == address(0)) revert ZeroAddress();
        if (_royaltyModule == address(0)) revert ZeroAddress();
        if (_licensingModule == address(0)) revert ZeroAddress();
        if (_pilTemplate == address(0)) revert ZeroAddress();
        if (_initialRate == 0) revert InvalidRate();

        mailbox = _mailbox;
        usdc = IERC20(_usdc);
        wip = IERC20(_wip);
        royaltyModule = _royaltyModule;
        licensingModule = _licensingModule;
        pilTemplate = _pilTemplate;
        usdcToWipRate = _initialRate;
        owner = msg.sender;
    }

    // ============ External Functions ============

    /// @notice Handle incoming Hyperlane message
    /// @dev Called by the Hyperlane mailbox when a message is delivered
    /// @param _origin Origin domain ID
    /// @param _sender Sender address (as bytes32)
    /// @param _message Encoded message payload
    function handle(uint32 _origin, bytes32 _sender, bytes calldata _message) external onlyMailbox whenNotPaused {
        if (_origin != AVALANCHE_DOMAIN) revert InvalidOrigin();
        if (_sender != trustedSender) revert UntrustedSender();

        // Decode operation type (first byte)
        uint8 opType = uint8(_message[0]);
        bytes memory payload = _message[1:];

        if (opType == OP_MINT_LICENSE) {
            _handleMintLicense(payload);
        } else if (opType == OP_CREATE_DERIVATIVE) {
            _handleCreateDerivative(payload);
        }
    }

    /// @notice Deposit WIP tokens to the liquidity pool
    /// @param amount Amount of WIP to deposit
    function depositWIP(uint256 amount) external {
        if (amount == 0) revert InvalidAmount();

        wip.safeTransferFrom(msg.sender, address(this), amount);
        wipLiquidity += amount;

        emit WIPDeposited(msg.sender, amount, wipLiquidity);
    }

    /// @notice Withdraw WIP tokens from the liquidity pool (owner only)
    /// @param amount Amount of WIP to withdraw
    function withdrawWIP(uint256 amount) external onlyOwner {
        if (amount == 0) revert InvalidAmount();
        if (wipLiquidity < amount) revert InsufficientLiquidity();

        wipLiquidity -= amount;
        wip.safeTransfer(owner, amount);

        emit WIPWithdrawn(owner, amount, wipLiquidity);
    }

    /// @notice Withdraw accumulated USDC (owner only)
    /// @param amount Amount of USDC to withdraw
    function withdrawUSDC(uint256 amount) external onlyOwner {
        if (amount == 0) revert InvalidAmount();

        uint256 balance = usdc.balanceOf(address(this));
        if (balance < amount) revert InsufficientLiquidity();

        usdc.safeTransfer(owner, amount);

        emit USDCWithdrawn(owner, amount);
    }

    /// @notice Set the USDC to WIP exchange rate
    /// @param newRate New exchange rate (18 decimals)
    function setExchangeRate(uint256 newRate) external onlyOwner {
        if (newRate == 0) revert InvalidRate();

        uint256 oldRate = usdcToWipRate;
        usdcToWipRate = newRate;

        emit ExchangeRateUpdated(oldRate, newRate);
    }

    /// @notice Set the trusted sender address on Avalanche
    /// @param _sender Server wallet address (as bytes32)
    function setTrustedSender(bytes32 _sender) external onlyOwner {
        bytes32 oldSender = trustedSender;
        trustedSender = _sender;

        emit TrustedSenderUpdated(oldSender, _sender);
    }

    /// @notice Transfer ownership of the contract
    /// @param newOwner New owner address
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();

        address oldOwner = owner;
        owner = newOwner;

        emit OwnershipTransferred(oldOwner, newOwner);
    }

    /// @notice Pause the contract
    function pause() external onlyOwner {
        paused = true;
        emit Paused(msg.sender);
    }

    /// @notice Unpause the contract
    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }

    // ============ View Functions ============

    /// @notice Calculate WIP amount from USDC amount
    /// @param usdcAmount Amount of USDC (6 decimals)
    /// @return wipAmount Amount of WIP (18 decimals)
    function calculateWIPAmount(uint256 usdcAmount) public view returns (uint256 wipAmount) {
        // USDC has 6 decimals, WIP has 18 decimals
        // usdcToWipRate is the amount of WIP per 1 USDC (with 18 decimals)
        // Formula: wipAmount = usdcAmount * usdcToWipRate / 1e6
        wipAmount = (usdcAmount * usdcToWipRate) / 1e6;
    }

    /// @notice Get payment record by message ID
    /// @param messageId Hyperlane message ID
    /// @return Payment record details
    function getPayment(bytes32 messageId) external view returns (PaymentRecord memory) {
        return payments[messageId];
    }

    /// @notice Check if contract has sufficient liquidity for an operation
    /// @param usdcAmount USDC amount to check
    /// @return hasLiquidity Whether there's sufficient liquidity
    /// @return requiredWIP Required WIP amount
    function checkLiquidity(uint256 usdcAmount) external view returns (bool hasLiquidity, uint256 requiredWIP) {
        requiredWIP = calculateWIPAmount(usdcAmount);
        hasLiquidity = wipLiquidity >= requiredWIP;
    }

    // ============ Internal Functions ============

    /// @notice Handle license minting operation
    /// @param payload Encoded payload with license details
    function _handleMintLicense(bytes memory payload) internal nonReentrant {
        (bytes32 messageId, address ipId, uint256 licenseTermsId, uint256 usdcAmount, address recipient) =
            abi.decode(payload, (bytes32, address, uint256, uint256, address));

        // Check if already processed
        if (payments[messageId].processed) revert PaymentAlreadyProcessed();

        // Calculate WIP amount
        uint256 wipAmount = calculateWIPAmount(usdcAmount);

        // Check liquidity
        if (wipLiquidity < wipAmount) {
            emit PaymentFailed(messageId, OP_MINT_LICENSE, "Insufficient liquidity");
            return;
        }

        // Deduct from liquidity pool
        wipLiquidity -= wipAmount;

        // Record payment
        payments[messageId] = PaymentRecord({
            payer: recipient,
            ipId: ipId,
            licenseTermsId: licenseTermsId,
            usdcAmount: usdcAmount,
            wipAmount: wipAmount,
            operationType: OP_MINT_LICENSE,
            processed: false,
            timestamp: block.timestamp
        });

        emit PaymentReceived(messageId, recipient, ipId, usdcAmount, wipAmount);

        // Approve WIP to royalty module
        wip.approve(royaltyModule, wipAmount);

        // Try to pay royalty
        try IRoyaltyModule(royaltyModule).payRoyaltyOnBehalf(ipId, address(0), address(wip), wipAmount) {
            // Try to mint license token
            try ILicensingModule(licensingModule).mintLicenseTokens(
                ipId, pilTemplate, licenseTermsId, 1, recipient, ""
            ) returns (uint256 startLicenseTokenId) {
                payments[messageId].processed = true;
                emit LicenseMinted(messageId, ipId, recipient, startLicenseTokenId, wipAmount);
            } catch Error(string memory reason) {
                // Refund WIP to pool
                wipLiquidity += wipAmount;
                emit PaymentFailed(messageId, OP_MINT_LICENSE, reason);
            } catch {
                wipLiquidity += wipAmount;
                emit PaymentFailed(messageId, OP_MINT_LICENSE, "License minting failed");
            }
        } catch Error(string memory reason) {
            // Refund WIP to pool
            wipLiquidity += wipAmount;
            emit PaymentFailed(messageId, OP_MINT_LICENSE, reason);
        } catch {
            wipLiquidity += wipAmount;
            emit PaymentFailed(messageId, OP_MINT_LICENSE, "Royalty payment failed");
        }
    }

    /// @notice Handle derivative creation operation
    /// @param payload Encoded payload with derivative details
    function _handleCreateDerivative(bytes memory payload) internal nonReentrant {
        (
            bytes32 messageId,
            address parentIpId,
            uint256 licenseTermsId,
            uint256 usdcAmount,
            uint256 chainId,
            address nftContract,
            uint256 tokenId
        ) = abi.decode(payload, (bytes32, address, uint256, uint256, uint256, address, uint256));

        // Check if already processed
        if (payments[messageId].processed) revert PaymentAlreadyProcessed();

        // Calculate WIP amount
        uint256 wipAmount = calculateWIPAmount(usdcAmount);

        // Check liquidity
        if (wipLiquidity < wipAmount) {
            emit PaymentFailed(messageId, OP_CREATE_DERIVATIVE, "Insufficient liquidity");
            return;
        }

        // Deduct from liquidity pool
        wipLiquidity -= wipAmount;

        // Record payment
        payments[messageId] = PaymentRecord({
            payer: address(0), // Will be set from nftContract owner
            ipId: parentIpId,
            licenseTermsId: licenseTermsId,
            usdcAmount: usdcAmount,
            wipAmount: wipAmount,
            operationType: OP_CREATE_DERIVATIVE,
            processed: false,
            timestamp: block.timestamp
        });

        emit PaymentReceived(messageId, address(0), parentIpId, usdcAmount, wipAmount);

        // Approve WIP to royalty module
        wip.approve(royaltyModule, wipAmount);

        // Try to create derivative
        try this._executeDerivativeCreation(messageId, parentIpId, licenseTermsId, wipAmount, chainId, nftContract, tokenId)
        {
            // Success handled in _executeDerivativeCreation
        } catch Error(string memory reason) {
            wipLiquidity += wipAmount;
            emit PaymentFailed(messageId, OP_CREATE_DERIVATIVE, reason);
        } catch {
            wipLiquidity += wipAmount;
            emit PaymentFailed(messageId, OP_CREATE_DERIVATIVE, "Derivative creation failed");
        }
    }

    /// @notice Execute derivative creation (external for try/catch)
    /// @dev This function is external to enable try/catch pattern
    function _executeDerivativeCreation(
        bytes32 messageId,
        address parentIpId,
        uint256 licenseTermsId,
        uint256 wipAmount,
        uint256 chainId,
        address nftContract,
        uint256 tokenId
    ) external {
        require(msg.sender == address(this), "Internal only");

        // Pay royalty to parent IP
        IRoyaltyModule(royaltyModule).payRoyaltyOnBehalf(parentIpId, address(0), address(wip), wipAmount);

        // Register the NFT as IP
        address derivativeIpId = IIPAssetRegistry(licensingModule).register(chainId, nftContract, tokenId);

        // Prepare arrays for registerDerivative
        address[] memory parentIds = new address[](1);
        parentIds[0] = parentIpId;
        uint256[] memory termIds = new uint256[](1);
        termIds[0] = licenseTermsId;

        // Link as derivative
        IIPAssetRegistry(licensingModule).registerDerivative(derivativeIpId, parentIds, termIds, pilTemplate, "");

        payments[messageId].processed = true;
        emit DerivativeCreated(messageId, parentIpId, derivativeIpId, wipAmount);
    }
}

// ============ Interfaces ============

/// @notice Story Protocol Royalty Module interface
interface IRoyaltyModule {
    function payRoyaltyOnBehalf(address receiverIpId, address payerIpId, address token, uint256 amount) external;
}

/// @notice Story Protocol Licensing Module interface
interface ILicensingModule {
    function mintLicenseTokens(
        address licensorIpId,
        address licenseTemplate,
        uint256 licenseTermsId,
        uint256 amount,
        address receiver,
        bytes calldata royaltyContext
    ) external returns (uint256 startLicenseTokenId);
}

/// @notice Story Protocol IP Asset Registry interface
interface IIPAssetRegistry {
    function register(uint256 chainId, address tokenContract, uint256 tokenId) external returns (address ipId);

    function registerDerivative(
        address childIpId,
        address[] calldata parentIpIds,
        uint256[] calldata licenseTermsIds,
        address licenseTemplate,
        bytes calldata royaltyContext
    ) external;
}

