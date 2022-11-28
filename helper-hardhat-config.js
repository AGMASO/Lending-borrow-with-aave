//Como ARGS debemos añadir la address del SmartContract de Chainlink-vrfCoordinationV2.
//En este js, vamos a crear la lógica, en la que le diremos que si la chainId es x que use Y, pero si es z, que use p.

const { ethers } = require("hardhat");

const networkConfig = {
  5: {
    name: "goerli",
    ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
  },
  31337: {
    name: "hardhat",
  },
  137: {
    name: "polygon",
  },
};

const VERIFICATION_BLOCK_CONFIRMATIONS = 2;
const INITIALSUPPLY = "5000000000000000000000000";
const MAINNETADDRESSWETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const DAIMAINADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const AMOUNT = ethers.utils.parseEther("0.02");

//Aqui vamos a especificar cual es nuestra developmentChain,

const developmentChain = ["hardhat", "localhost"];

/**
 * !Los argumentos que necesita el deployment de MockV3Aggregator, es decir el test, son decimals y initial_answer
 * ! Por esto los debemos definir aquí, y luego exportarlos al contrato.
 */

module.exports = {
  networkConfig,
  developmentChain,
  VERIFICATION_BLOCK_CONFIRMATIONS,
  INITIALSUPPLY,
  MAINNETADDRESSWETH,
  AMOUNT,
  DAIMAINADDRESS,
};
