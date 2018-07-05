var AssetProof = artifacts.require("./AssetProof.sol");

module.exports = function(deployer) {
  deployer.deploy(AssetProof);
};