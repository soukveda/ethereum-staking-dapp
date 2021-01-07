pragma solidity ^0.5.0;

// Import relevant tokens
import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm {
    // All smart contract code will go here

    // state variable; will be stored on the blockchain
    string public name = "Chris's Dapp Token Farm";
    DappToken public dappToken;
    DaiToken public daiToken;
    address public owner;

    // array to keep track of all addresses that have staked
    address[] public stakers;

    // hash mapping addresses to token amounts and bool
    mapping(address=>uint) public stakingBalance;
    mapping(address=>bool) public hasStaked;
    mapping(address=>bool) public isStaking;

    // Constructor; passes addresses of given tokens
    constructor(DappToken _dappToken, DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    // creating stake tokens (deposit)
    function stakeTokens(uint _amount) public {
        // require the amount be greater than 0
        require(_amount > 0, 'amount cannot be 0 or less');
        
        // transfer mock dai tokens to this smart contract for staking
        // 'msg.sender' corresponds to whoever called this function
        // 'this' corresponds to the smart contract
        daiToken.transferFrom(msg.sender, address(this), _amount);

        // update the staking balane
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

        // adding users to stakers array only if they have not been staked already
        if(!hasStaked[msg.sender]){
            stakers.push(msg.sender);
        }

        // update the staking status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    // function to unstake tokens (withdraw)
    function unstakeTokens() public {
        // fetch the staking balance
        uint balance = stakingBalance[msg.sender];

        // require the available staking balance to be greater than 0
        require(balance>0,'staking balance cannot be 0 or less');

        // transfer mock DAI tokens to this contract for staking
        daiToken.transfer(msg.sender, balance);

        // reset the staking balance
        stakingBalance[msg.sender] = 0;

        // update the staking status
        isStaking[msg.sender] = false;
    }
    
    // function to issue tokens (reward)
    function issueTokens() public {
        // require the caller of this function to only be the owner
        require(msg.sender == owner, 'caller must be the owner!');

        // issue tokens to all stakers
        for (uint i=0; i<stakers.length; i++) {
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            
            if (balance>0) {
                dappToken.transfer(recipient, balance);
            }
        }
    }
}

