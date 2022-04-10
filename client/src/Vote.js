import React, { Component } from "react";
import Web3 from "web3";
import { Biconomy } from "@biconomy/mexa";
import VotingContract from "./contracts/VotingContract.json";
import getWeb3 from "./getWeb3";
import Navbar from "./Navbar";
import NavbarAdmin from "./NavbarAdmin";
import { FormGroup, FormControl, Button, Card } from "react-bootstrap";
import img from "./img_avatar.png";

let instance;
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
class Vote extends Component {
  state = {
    web3: null,
    accounts: null,
    contract: null,
    isOwner: false,
    start: false,
    myAccount: null,
    candidateId: "",
    candidateLists: null,
  };
  updateCandidateId = (event) => {
    this.setState({ candidateId: event.target.value });
  };

  vote = async () => {
    await this.state.VotingInstance.methods
      .vote(this.state.candidateId)
      .send({ from: this.state.account });
    window.location.reload(false);
  };

  componentDidMount = async () => {
    // FOR REFRESHING PAGE ONLY ONCE -
    if (!window.location.hash) {
      window.location = window.location + "#loaded";
      window.location.reload();
    }

    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      //Biconomy

      // biconomy
      //   .onEvent(biconomy.READY, () => {
      //     // Initialize your dapp here like getting user accounts etc
      //     const deployedNetwork = VotingContract.networks[42];
      //     instance = new web3.eth.Contract(
      //       VotingContract.abi,
      //       deployedNetwork && deployedNetwork.address
      //     );
      //   })
      //   .onEvent(biconomy.ERROR, (error, message) => {
      //     // Handle error while initializing mexa
      //   });
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = VotingContract.networks[42];
      const instance = new web3.eth.Contract(
        VotingContract.abi,
        deployedNetwork && deployedNetwork.address
      );

      this.setState({
        VotingInstance: instance,
        web3: web3,
        account: accounts[0],
      });

      let myAccount = await this.state.VotingInstance.methods.voterAddresses(
        this.state.accounts
      );
      this.setState({ myAccount: myAccount });

      let candidateCount = await this.state.VotingInstance.methods
        .getCandidateCount()
        .call();

      let candidateList = [];
      for (let i = 0; i < candidateCount; i++) {
        let candidate = await this.state.VotingInstance.methods
          .candidateDetails(i)
          .call();
        candidateList.push(candidate);
      }
      this.setState({ candidateLists: candidateList });

      let start = await this.state.VotingInstance.methods
        .electionStatus()
        .call();

      this.setState({ start: start });

      const owner = await this.state.VotingInstance.methods.getOwner().call();
      if (this.state.account === owner) {
        this.setState({ isOwner: true });
      }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  render() {
    let candidateList;
    if (this.state.candidateLists) {
      candidateList = this.state.candidateLists.map(
        (candidate, candidateId) => {
          return (
            <div className="candidate" key={candidateId}>
              <img src={img} className="img-cand" alt="..." />
              <h5 className="candidateName">{candidate.name}</h5>
              <div className="candidateDetails">
                <div>Candidate ID : {candidate.candidateId}</div>
                <div>Details : {candidate.details}</div>
              </div>
              <br></br>
              <br></br>
            </div>
          );
        }
      );
    }

    if (!this.state.web3) {
      return (
        <div className="CandidateDetails">
          <div className="CandidateDetails-title">
            <h1>Loading Web3, accounts, and contract..</h1>
          </div>
          {this.state.isOwner ? <NavbarAdmin /> : <Navbar />}
        </div>
      );
    }

    if (!this.state.start) {
      return (
        <div className="CandidateDetails">
          {this.state.isOwner ? <NavbarAdmin /> : <Navbar />}
          <div className="CandidateDetails-title">
            <h1>VOTING HAS NOT STARTED YET.</h1>
          </div>

          <div className="CandidateDetails-sub-title">
            Please Wait.....While election starts !
          </div>
        </div>
      );
    }

    if (this.state.myAccount) {
      if (this.state.myAccount.hasVoted) {
        return (
          <div className="CandidateDetails">
            <div className="CandidateDetails-title">
              <h1>YOU HAVE SUCCESSFULLY CAST YOUR VOTE</h1>
            </div>
            {this.state.isOwner ? <NavbarAdmin /> : <Navbar />}
          </div>
        );
      }
    }

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
}

export default Vote;
