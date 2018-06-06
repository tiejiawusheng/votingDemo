var Voting = artifacts.require("./Voting.sol");

module.exports = function(deployer) {
  deployer.deploy(Voting,100,10,["C++","Python","Php","Javascript","Java"]);
};
