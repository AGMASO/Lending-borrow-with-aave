/**
 * ! Ethereum es un native token de la blockchain L1, por lo que no es propiamente dicho un erc20.
 * !Aave Protocol trata a todos los tokes que usa como ERC20, para facilitar los procesos que lleva a cabo.
 * !Por eso vemos en la mayoria de Defi protocol que el ETH se pasa a WETH. El WETH lo que hace es transformar
 * ! nuestro ETH en un ERC20 token.
 * !Vamos a crear una function para depositar nuesto ETh y que nos de WETH usando el SMartcontrat de WETH
 */
const { getNamedAccounts, ethers } = require("hardhat");
const { MAINNETADDRESSWETH, AMOUNT } = require("../helper-hardhat-config");
async function getWeth() {
  const { deployer } = await getNamedAccounts();
  //Siguiente paso es llamar a la function DEPOSIT de Iweth. Para ello como simpre, necesitamos address y ABI.
  //Usaremos el address de Mainnet de WETH. Esto es porque vamos a usar un FORK de la mainent esta vez.
  const Iweth = await ethers.getContractAt(
    "IWeth",
    MAINNETADDRESSWETH,
    deployer
  );
  const tx = await Iweth.deposit({ value: AMOUNT });
  await tx.wait(1);

  const wethBalance = await Iweth.balanceOf(deployer);
  console.log(`You have ${wethBalance.toString()} WETH in your balance`);
}

module.exports = { getWeth };
