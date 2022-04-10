import React, { Component, useState, useEffect } from "react";
import Web3 from "web3";
import { Biconomy } from "@biconomy/mexa";
import VotingContract from "./contracts/VotingContract.json";
import getWeb3 from "./getWeb3";
import Navbar from "./Navbar";
import NavbarAdmin from "./NavbarAdmin";
import { FormGroup, FormControl, Button, Card } from "react-bootstrap";
import img from "./img_avatar.png";

let web3, walletWeb3, biconomy;
let contract;

let config = {
  contract: {
    address: "0xF5955950010C8b8f97E8eAAaAa3239EA3904477c",
    abi: [
      {
        inputs: [
          {
            internalType: "address",
            name: "_trustedForwarder",
            type: "address",
          },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        name: "candidateDetails",
        outputs: [
          {
            internalType: "uint256",
            name: "candidateId",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "details",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "voteCount",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "forwarder",
            type: "address",
          },
        ],
        name: "isTrustedForwarder",
        outputs: [
          {
            internalType: "bool",
            name: "",
            type: "bool",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
        ],
        name: "voterAddresses",
        outputs: [
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "voterId",
            type: "string",
          },
          {
            internalType: "address",
            name: "voterAddress",
            type: "address",
          },
          {
            internalType: "bool",
            name: "hasVoted",
            type: "bool",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "string",
            name: "_name",
            type: "string",
          },
          {
            internalType: "string",
            name: "_details",
            type: "string",
          },
        ],
        name: "addCandidate",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "string",
            name: "_name",
            type: "string",
          },
          {
            internalType: "string",
            name: "_voterId",
            type: "string",
          },
          {
            internalType: "address",
            name: "_voterAddress",
            type: "address",
          },
          {
            internalType: "bool",
            name: "_hasVoted",
            type: "bool",
          },
        ],
        name: "manualAddVoter",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "_candidateId",
            type: "uint256",
          },
        ],
        name: "vote",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "startElection",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "endEelection",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "electionStatus",
        outputs: [
          {
            internalType: "bool",
            name: "",
            type: "bool",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "electionResults",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "viewWinner",
        outputs: [
          {
            internalType: "string",
            name: "",
            type: "string",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getVoterCount",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getOwner",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getCandidateCount",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],
  },
  apiKey: "3zYDdJsa7.fdf5159f-eb84-4d47-bf7f-4d2dfa03e130",
};

function VoteBi() {
  const [web3, setweb3] = useState("");
  const [accounts, setAccounts] = useState("");
  const [contract, setContract] = useState("");
  const [isOwner, setOwner] = useState(false);
  const [start, setStart] = useState(false);
  const [myAccount, setAccount] = useState(null);
  const [candidateId, setCandidateId] = useState("");
  const [candidateLists, setCandidateLists] = useState("");

  useEffect(() => {
    if (typeof window.ethereum !== "undefined" && window.ethereum.isMetaMask)
     {
        const provider = window["ethereum"];
        await provider.enable();
        const biconomy = new Biconomy(
            new Web3.providers.HttpProvider(
              "https://kovan.infura.io/v3/686061bed3ac4c8785426e9332e78166"
            ),
            {
              walletProvider: window.ethereum,
              apiKey: "3zYDdJsa7.fdf5159f-eb84-4d47-bf7f-4d2dfa03e130",
              debug: true,
            }
          );
          web3 = new Web3(biconomy);
          walletWeb3 = new Web3(window.ethereum);
          biconomy.onEvent(biconomy.READY, () => {
            // Initialize your dapp here like getting user accounts etc
            contract = new web3.eth.Contract(
                config.contract.abi,
                config.contract.address
            );
            setSelectedAddress(provider.selectedAddress);
            getQuoteFromNetwork();
            provider.on("accountsChanged", function (accounts) {
                setSelectedAddress(accounts[0]);
            });
        }).onEvent(biconomy.ERROR, (error, message) => {
            // Handle error while initializing mexa
        });
    } else {
        showErrorMessage("Metamask not installed");
    }
    init();
  }, []);
  const updateCandidateId = (event) => {
    setCandidateId( event.target.value );
  };
  const vote = async () => {
    await VotingInstance.methods
      .vote(candidateId)
      .send({ from: account });
    window.location.reload(false);
  };


  return (
    <div className="App text-center background-blue">
    {/* <div>{this.state.owner}</div> */}
    {/* <p>Account address - {this.state.account}</p> */}
    {this.state.isOwner ? <NavbarAdmin /> : <Navbar />}
    <div className="CandidateDetails">
      <div className="CandidateDetails-title">
        <h1>VOTE</h1>
      </div>
    </div>

    <div className="form">
      <FormGroup>
        <div className="form-label">
          Enter Candidate ID you want to vote{" "}
        </div>
        <div className="form-input">
          <FormControl
            input="text"
            value={this.state.candidateId}
            onChange={this.updateCandidateId}
          />
        </div>

        <Button onClick={this.vote} className="button-vote">
          Vote
        </Button>
      </FormGroup>
    </div>
    <br></br>

    {/* <Button onClick={this.getCandidates}>
          Get Name
        </Button> */}

    {this.state.toggle ? (
      <div>You can only vote to your own constituency</div>
    ) : (
      ""
    )}

    <div>{candidateList}</div>
  </div>
  );
}

export default VoteBi;
