pragma solidity ^0.4.17;

contract Voting {
     //总票数
    uint public totalVoteCount; 
    //剩余票数
    uint public balanceVoteCount;
    //选民数量
    uint public voterCount;
    //每个选举人的初始票数
    uint public votePerUser;

    //候选人
    struct Proposal {
        bytes32 name;
        uint voteCount;
    }
    //候选人列表
    Proposal[] public proposals;
   
    //投票人
    struct Voter {
        uint voteCount;//票数
        uint[] history;//投票记录
    }
    //投票人地址和信息映射
    mapping (address => Voter) private voterInfo;

    //获取候选人列表数量
    function proposalCount() view external returns(uint) {
        return proposals.length;
    }

    //获取投票人信息
    function getVoterInfo(address user) view external returns (uint, uint[]) {
        return (voterInfo[user].voteCount, voterInfo[user].history);
    }
    
    //注册，获得投票权
    function regist() external{
        //判断剩余票数是否够支持创建新的选举人
        require(balanceVoteCount >= votePerUser);
        //未注册
        require(voterInfo[msg.sender].history.length == 0);
        //创建选举人
        voterInfo[msg.sender].voteCount += votePerUser;
        
        //减少总票数
        balanceVoteCount -= votePerUser;
        for(uint i = 0; i < proposals.length; i++) {
            voterInfo[msg.sender].history.push(0);
        }
        voterCount++;
    }

     //给选举人投票
    function vote(uint _proposal, uint _voteCount) external{
        //是否有足够的票数
        require(voterInfo[msg.sender].voteCount >= _voteCount);
        //候选人正确
        require(_proposal >= 0 && _proposal < proposals.length);
        //增加候选人票数
        proposals[_proposal].voteCount += _voteCount;
        //减少投票人票数
        voterInfo[msg.sender].voteCount -= _voteCount;
        //投票记录
        voterInfo[msg.sender].history[_proposal] += _voteCount;
    }

    //初始化
    constructor(uint _totalVoteCount,uint _votePerUser,bytes32[] proposalNames) public {
        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
        totalVoteCount = _totalVoteCount;
        balanceVoteCount = _totalVoteCount;
        votePerUser = _votePerUser;
    }
}
