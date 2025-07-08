// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CoreLend is Ownable {
    uint256 public interestRatePerYear = 10; // 10%
    uint256 public constant SECONDS_IN_YEAR = 365 * 24 * 60 * 60;
    uint256 public collateralFactor = 150; // 150% (1.5x)

    struct Loan {
        address collateralToken;
        address borrowToken;
        uint256 collateralAmount;
        uint256 borrowAmount;
        uint256 timestamp;
    }

    // Track supported tokens
    mapping(address => bool) public isSupportedToken;

    // Lender balances: lender => token => balance
    mapping(address => mapping(address => uint256)) public lenderBalances;

    // Borrower loans
    mapping(address => Loan) public loans;

    modifier onlySupported(address token) {
        require(isSupportedToken[token], "Unsupported token");
        _;
    }

    function addSupportedToken(address token) external onlyOwner {
        isSupportedToken[token] = true;
    }

    function deposit(address token, uint256 amount) external onlySupported(token) {
        require(amount > 0, "Invalid amount");
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        lenderBalances[msg.sender][token] += amount;
    }

    function withdraw(address token, uint256 amount) external {
        require(lenderBalances[msg.sender][token] >= amount, "Insufficient balance");
        lenderBalances[msg.sender][token] -= amount;
        IERC20(token).transfer(msg.sender, amount);
    }

    function borrow(address collateralToken, address borrowToken, uint256 borrowAmount) external 
        onlySupported(collateralToken) onlySupported(borrowToken)
    {
        require(borrowAmount > 0, "Invalid borrow amount");

        uint256 requiredCollateral = (borrowAmount * collateralFactor) / 100;
        IERC20(collateralToken).transferFrom(msg.sender, address(this), requiredCollateral);

        loans[msg.sender] = Loan({
            collateralToken: collateralToken,
            borrowToken: borrowToken,
            collateralAmount: requiredCollateral,
            borrowAmount: borrowAmount,
            timestamp: block.timestamp
        });

        IERC20(borrowToken).transfer(msg.sender, borrowAmount);
    }

    function repay() external {
        Loan memory loan = loans[msg.sender];
        require(loan.borrowAmount > 0, "No loan");

        uint256 timeElapsed = block.timestamp - loan.timestamp;
        uint256 interest = (loan.borrowAmount * interestRatePerYear * timeElapsed) / (100 * SECONDS_IN_YEAR);
        uint256 totalRepay = loan.borrowAmount + interest;

        IERC20(loan.borrowToken).transferFrom(msg.sender, address(this), totalRepay);
        IERC20(loan.collateralToken).transfer(msg.sender, loan.collateralAmount);

        delete loans[msg.sender];
    }

    function currentDebt(address user) public view returns (uint256) {
        Loan memory loan = loans[user];
        if (loan.borrowAmount == 0) return 0;

        uint256 timeElapsed = block.timestamp - loan.timestamp;
        uint256 interest = (loan.borrowAmount * interestRatePerYear * timeElapsed) / (100 * SECONDS_IN_YEAR);
        return loan.borrowAmount + interest;
    }

    function liquidate(address user) external {
        Loan memory loan = loans[user];
        require(loan.borrowAmount > 0, "No loan");

        uint256 debt = currentDebt(user);
        require((loan.collateralAmount * 100) / debt < collateralFactor, "Healthy loan");

        delete loans[user];
        IERC20(loan.collateralToken).transfer(msg.sender, loan.collateralAmount);
    }
}
