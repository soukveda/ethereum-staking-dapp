const { assert } = require('chai');

const DaiToken = artifacts.require('DaiToken');
const DappToken = artifacts.require('DappToken');
const TokenFarm = artifacts.require('TokenFarm');

require('chai')
    .use(require('chai-as-promised'))
    .should()

// helper function to convert tokens to wei
function tokens(n) {
    return web3.utils.toWei(n, 'Ether');
}

contract('TokenFarm', ([owner, investor])=> {
    // Write tests here

    let daiToken, dappToken, tokenFarm;

    // before hook function
    before(async () => {
        // load all contracts
        daiToken = await DaiToken.new();
        dappToken = await DappToken.new();
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address);

        // transfer all dapp tokens to the farm (1 million tokens)
        await dappToken.transfer(tokenFarm.address, tokens('1000000'));

        // send tokens to an investor
        await daiToken.transfer(investor, tokens('100'), {from:owner})
    });

    // correctly describe the mock dai token
    describe('Mock Dai deployment', async () => {
        it('has a name', async() => {
            const name = await daiToken.name();
            assert.equal(name, 'Mock DAI Token');
        });
    });

    // correctly describe the dapp token
    describe('Dapp Token deployment', async () => {
        it('has a name', async() => {
            const name = await dappToken.name();
            assert.equal(name, 'DApp Token');
        });
    });

    // correctly describe the token farm
    describe('Token Farm deployment', async () => {
        it('has a name', async() => {
            const name = await tokenFarm.name();
            assert.equal(name, "Chris's Dapp Token Farm");
        });

        it('contracts has tokens', async () => {
            let balance = await dappToken.balanceOf(tokenFarm.address);
            assert.equal(balance.toString(), tokens('1000000'));
        });
    });
    
    // check to see if our staking function works properly
    describe('Farming tokens', async () => {
        it('rewards investors for staking mDai tokens', async () => {
            let result

            // check the investor balance before staking
            result = await daiToken.balanceOf(investor);
            assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct before staking');

            // stake mock DAI tokens
            await daiToken.approve(tokenFarm.address, tokens('100'), {from: investor});
            await tokenFarm.stakeTokens(tokens('100'), {from: investor});

            // check the staking result (balance of); balance should be 0 after transferring tokens to stake
            result = await daiToken.balanceOf(investor);
            assert.equal(result.toString(), tokens('0'), 'investor mock DAI wallet balance correct after staking');

            result = await daiToken.balanceOf(tokenFarm.address);
            assert.equal(result.toString(), tokens('100'), 'Token Farm mock DAI wallet balance correct after staking');  
            
            result = await tokenFarm.stakingBalance(investor);
            assert.equal(result.toString(), tokens('100'), 'investor staking balance correct after staking');

            result = await tokenFarm.isStaking(investor);
            assert.equal(result.toString(), 'true', 'investor staking status correct after staking');

            // issue the tokens
            await tokenFarm.issueTokens({from: owner});

            // check the balance after the tokens are issued
            result = await dappToken.balanceOf(investor);
            assert.equal(result.toString(), tokens('100'), 'investor dapp token wallet balance correct after issuance');

            // check to ensure that only the owner can issue tokens
            await tokenFarm.issueTokens({from: investor}).should.be.rejected;

            // check to make sure we can unstake the tokens
            await tokenFarm.unstakeTokens({from: investor});

            // check the results after unstaking
            result = await daiToken.balanceOf(investor);
            assert.equal(result.toString(), tokens('100'), 'investor mock DAI wallet balance correct after staking');

            result = await daiToken.balanceOf(tokenFarm.address);
            assert.equal(result.toString(), tokens('0'), 'token farm mock dai balance correct after staking');

            result = await tokenFarm.stakingBalance(investor);
            assert.equal(result.toString(), tokens('0'), 'investor staking balance correct after staking');

            result = await tokenFarm.isStaking(investor);
            assert.equal(result.toString(), 'false', 'investor staking status correct after staking');
        });
    });
});