// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

import voting_artifacts from '../../build/contracts/Voting.json'

var Voting = contract(voting_artifacts);
var voteInstance;    

var proposals = [];
var userAddress = "";

//初始化
window.onload = function() {
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));
    Voting.setProvider(web3.currentProvider);
    appStart();
};

//启动函数
function appStart() {
    Voting.deployed()
    .then(function(contractInstance) {
        voteInstance = contractInstance;
        getVoteInfo();
        getProposalList();
    })
}

//获取投票活动信息
function getVoteInfo() {
  voteInstance.totalVoteCount.call().then(function(v) {
      document.getElementById("tokens-total").innerHTML = v.toString();
  });
  voteInstance.balanceVoteCount.call().then(function(v) {
    document.getElementById("tokens-balance").innerHTML = v.toString();
  });
  voteInstance.voterCount.call().then(function(v) {
    document.getElementById("voter-count").innerHTML = v.toString();
  });
  voteInstance.votePerUser.call().then(function(v) {
    document.getElementById("vote-per-user").innerHTML = v.toString();
   });
}
//获取候选人列表
function getProposalList() {
    voteInstance.proposalCount.call()
    .then(function (count) {
        var func_arr = [];
        for(var i =0;i < count.toString();i++){
            func_arr.push(voteInstance.proposals.call(i));
        }
        return Promise.all(func_arr);
    })
    .then(function (resultList) {
        var candidateRows = document.getElementById("proposals");
        var voteRows = document.getElementById("vote-rows");
        var candidateRows_html = "";
        var voteRows_html = "";
        proposals = resultList.map(function (e,i) {
            var p = {};
            p.name = web3.toUtf8(e[0]);
            p.votCount = e[1].toString();
            candidateRows_html +="<tr><td>" + p.name + "</td><td id='" + i + "'>"+ p.votCount +"</td></tr>";  
            var check = "";
            if(i ==0){
                check = "checked";
            } 
            voteRows_html += "<label class=\"radio-inline\"><input type=\"radio\" name=\"vote-radio\" class=\"vote-radio\" "+ check + " value="+ i +">"+ p.name +"</label>" ;        
            return p;
        });
        candidateRows.innerHTML = candidateRows_html;
        voteRows.innerHTML = voteRows_html;
    });
}
//登记函数
window.regist = function () {
    userAddress = document.getElementById("user-address").value;
    getUserInfo();
}
//登记操作
function _regist() {
    voteInstance.regist({gas:300000,from:userAddress})
    .then(function (v) {
        getUserInfo();
        getVoteInfo();        
    })
    .catch(function (e) {
        alert("异常: " + e);
    });
}
//投票函数
window.vote = function() {
    var _id = 0;
    var _count = 0;
    _count = document.getElementById("vote-count").value;
    var voteRadio = document.getElementsByClassName("vote-radio");
    for(var i = 0;i< voteRadio.length;i++){
        if(voteRadio[i].checked){
            _id = i;
            break;
        }
    }
    console.log(_id);
    console.log(_count);
    voteInstance.vote(parseInt(_id),parseInt(_count),{gas:300000,from:userAddress}) 
    .then(function (v) {
        console.log(v);
        getProposalList();
        getUserInfo();
    })
    .catch(function (e) {
        alert("异常: " + e);
    });
}
//获取投票人信息
function getUserInfo() {   
    voteInstance.getVoterInfo.call(userAddress)
    .then(function (result) {
        var userInfo = {
            voteCount: result[0].toString(),
            history:result[1]
        }
        console.log(userInfo);    
        //如果未注册则注册
       if(userInfo.history.length == 0){
           _regist();
       }else{
        //更新用户信息           
        document.getElementById("userInfo-address").innerHTML = userAddress;
        document.getElementById("userInfo-vote-count").innerHTML = userInfo.voteCount;
        var userInfoHistory = document.getElementById("userInfo-history");
        var tr = "";
        userInfo.history.forEach(function(e,i){
            tr +="<tr><td>" + proposals[i].name + "</td><td id='" + i + "'>"+ e +"</td></tr>";                       
        });
        userInfoHistory.innerHTML = tr;        
       }
    });
}
