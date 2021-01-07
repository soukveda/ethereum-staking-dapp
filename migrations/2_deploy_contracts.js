const TokenFarm = artifacts.require("TokenFarm");
const DaiToken = artifacts.require("DaiToken");
const DappToken = artifacts.require("DappToken");

module.exports = async function(deployer, network, accounts) {
    // deploy the dai token (this is a mock token)
    await deployer.deploy(DaiToken);
    const daiToken = await DaiToken.deployed();

    // deploy the dapp token
    await deployer.deploy(DappToken);
    const dappToken = await DappToken.deployed();

    // deploy the tokenFarm, along with the respective addresses of the tokens to transfer to the tokenFarm
    await deployer.deploy(TokenFarm, daiToken.address, dappToken.address);
    const tokenFarm = await TokenFarm.deployed();

    // transfer all of the tokens to the TokenFarm (1 million)
    await dappToken.transfer(tokenFarm.address, '1000000000000000000000000');

    // transfer 100 mock dai tokens to an investor
    await daiToken.transfer(accounts[1], '1000000000000000000000000');
};


