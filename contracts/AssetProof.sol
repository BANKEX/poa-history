pragma solidity ^0.4.21;

contract Ownable {
    address public owner;

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        _transferOwnership(_newOwner);
    }

    function _transferOwnership(address _newOwner) internal {
        require(_newOwner != address(0));
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
}

contract IProof is Ownable {
    function setRootHash(bytes32 _hash) external returns (bool);
    function getRootHash() external view returns (bytes32);

    event SetRootHash(uint indexed timestamp, bytes32 indexed hash);
}

contract AssetProof is IProof {
    bytes32 internal rootHash;

    function setRootHash(bytes32 _hash) external onlyOwner returns (bool) {
        rootHash = _hash;
        emit SetRootHash(block.timestamp, _hash);
        return true;
    }

    function getRootHash() external view returns (bytes32) {
        return rootHash;
    }
}