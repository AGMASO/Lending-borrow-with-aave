/**
 * !En este file, vamos a pedir borrow al contrato aave. Para ello primero necesitamos WETH. por lo que hemos creado
 * !primeramente la function getWeth(), que es la primera que ejecutamos en MAIN().
 * !Una vez tenemos WETH, necesitamos llamar al contraro de AAVE y a su function borrow(). Necesitamos address y abi para hacer eso.
 * !Importamos getWeth()
 */
const { getNamedAccounts, ethers } = require("hardhat");
const { getWeth } = require("../scripts/getWeth");
const {
  MAINNETADDRESSWETH,
  AMOUNT,
  DAIMAINADDRESS,
} = require("../helper-hardhat-config");

async function main() {
  await getWeth();

  //creamos deployer y contrato de aave.

  const { deployer } = await getNamedAccounts();

  //Abi,Address
  //Una vez ya tenemos IlendingPool, queremos hacer el deposit y luego el borrow.Para ello primero tenemos que aprovar que
  //Aave pueda usar nuestros fondos.

  //Llamamos a la function que hemos creado abajo, y que nos encuentra y conecta la lendingPool con el deployer
  const IlendingPool = await getLendingPool(deployer);

  console.log(
    `This is the address of the IlendingPool ${IlendingPool.address}`
  );

  //DEPOSIT & APPROVAL. Vamos a depositar WETH to AAVE. necesitamos aproval.

  const wethTokenAddress = MAINNETADDRESSWETH;
  await approveERC20(wethTokenAddress, IlendingPool.address, AMOUNT, deployer);
  console.log("Depositing!!!");

  //Procedemos con deposit
  await IlendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0);
  console.log("Deposited Amount wished");

  //BORROW from AAVE
  //NEcesitamos saber algunas informaciones: Por ejmeplo: Cuanto hemos Borrowed, Cuanto tenemos de Collateral, y cuanto podemos
  //Borrow.

  let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(
    IlendingPool,
    deployer
  );

  console.log(
    `You have a debt of ${totalDebtETH}, and a ${availableBorrowsETH} worth of ETH`
  );
  //Borrowing. Vamos a borrow Dai. para ello debemos saber a cuanto se cambia nuestro Dai por Eth.
  //Para ello necesitamos un oracle. En este caso el de Link. Hay que importar y obtener este dato.

  const DaiPrice = await getDaiPrice();
  //Ya tenemos el precio, ahora necesitamos saber, cuanto DAI podemos borrow.
  const amountDaiToBorrow =
    availableBorrowsETH.toString() * 0.95 * (1 / DaiPrice.toNumber());
  console.log("You could borrow " + amountDaiToBorrow.toString() + " DAI");

  /**
   * !Por ultimo necesitmaos transformar el amountofDai en WEI
   */
  const amountDaiToBorrowWei = await ethers.utils.parseEther(
    amountDaiToBorrow.toString()
  );

  //Finalmente function BORROW the lendingPool
  daiAddress = DAIMAINADDRESS;

  await borrowDai(DAIMAINADDRESS, IlendingPool, amountDaiToBorrowWei, deployer);

  await getBorrowUserData(IlendingPool, deployer);

  //REPAY ASSETS

  await repay(DAIMAINADDRESS, IlendingPool, amountDaiToBorrowWei, deployer);
  await getBorrowUserData(IlendingPool, deployer);
}

/**
 * !Function para sacar el IlendingPool de aave y conectarla a nuestro deployer.
 */
async function getLendingPool(account) {
  //Abi,Address
  //Obtenemos primero la address del lendingPool gracias al contrato IlendingPoolAddressProvider.sol
  //Tambein obtenemos el contrato IlendingPool que es el que nos interesa.
  const getLendingPoolProvider = await ethers.getContractAt(
    "ILendingPoolAddressesProvider",
    "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
    account
  );
  const LendingPoolAddress = await getLendingPoolProvider.getLendingPool();
  const LendignPool = await ethers.getContractAt(
    "ILendingPool",
    LendingPoolAddress,
    account
  );
  return LendignPool;
}

/**
 * !Async function for approval.
 */
async function approveERC20(
  erc20Address,
  spenderAddress,
  amountToSpend,
  account
) {
  const erc20Token = await ethers.getContractAt(
    "IERC20",
    erc20Address,
    account
  );
  const tx = await erc20Token.approve(spenderAddress, amountToSpend);
  await tx.wait(1);
  console.log("Approved!!");
}
/**
 * ! GetBorrwoUserData. Function para obtener los datos para poder usar borrow. Es decir, tener la informacion de cuanto podemos
 * !pedir, cuanto tenemos de collateral y cuanto es nuestro value of Health
 */

async function getBorrowUserData(LendignPool, account) {
  const {
    totalCollateralETH,
    totalDebtETH,
    availableBorrowsETH,
    currentLiquidationThreshold,
    ltv,
    healthFactor,
  } = await LendignPool.getUserAccountData(account);

  console.log(`You have ${totalCollateralETH} worth of ETH deposited`);
  console.log(`You have ${totalDebtETH} of ETH borrowed`);
  console.log(`You can ${availableBorrowsETH} worth of ETH`);
  console.log(`You have a ${currentLiquidationThreshold} liquidation Price`);
  console.log(`You have a total debt of ${totalDebtETH} ETH`);
  console.log(`You have ${healthFactor} healthFactor`);

  return { totalDebtETH, availableBorrowsETH };
}

/**
 * !Function para descubir el precio ode Dai comparado con ETh
 */
async function getDaiPrice() {
  const AggregatorV3Interface = await ethers.getContractAt(
    "AggregatorV3Interface",
    "0x773616E4d11A78F511299002da57A0a94577F1f4"
  );
  //No necesitamos poner el deployero acccount como tercer parámetro ya que es una function VIEW, es decir que no hay que
  //escribir o enviar ninguna informacion, es solo leer.
  const { answer } = await AggregatorV3Interface.latestRoundData();
  console.log(`Price of Dai is ${answer.toString()}`);
  return answer;
}
/**
 * !Function Borrow DAI
 */

async function borrowDai(
  daiAddress,
  IlendingPool,
  amountDaiToBorrowWei,
  acccount
) {
  const borrowTx = await IlendingPool.borrow(
    daiAddress,
    amountDaiToBorrowWei,
    1,
    0,
    acccount
  );
  await borrowTx.wait(1);
  console.log("You´ve borrowed Dai");
}

/**
 * !Function Repay.
 */

async function repay(daiAddress, IlendingPool, amountDaiToBorrowWei, account) {
  //Tenemos que volver a aprobar el envio de Dai a aave.
  await approveERC20(
    daiAddress,
    IlendingPool.address,
    amountDaiToBorrowWei,
    account
  );

  const repayTx = await IlendingPool.repay(
    daiAddress,
    amountDaiToBorrowWei,
    1,
    account
  );
  await repayTx.wait(1);
  console.log("You got repayed your money");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
