"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/components/wallet-provider"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle, Calculator, TrendingDown } from "lucide-react"

const tokens = [
  { symbol: "USDT", name: "Tether USD", logo: "💵" },
  { symbol: "DAI", name: "Dai Stablecoin", logo: "🟡" },
  { symbol: "USDC", name: "USD Coin", logo: "🔵" },
]

export default function BorrowPage() {
  const { isConnected, isCorrectNetwork } = useWallet()
  const { toast } = useToast()
  const [collateralToken, setCollateralToken] = useState("")
  const [borrowToken, setBorrowToken] = useState("")
  const [borrowAmount, setBorrowAmount] = useState("")

  const collateralRequired = borrowAmount ? (Number.parseFloat(borrowAmount) * 1.5).toFixed(2) : "0.00"
  const liquidationPrice = borrowAmount ? (Number.parseFloat(borrowAmount) * 1.33).toFixed(2) : "0.00"

  const handleBorrow = async () => {
    if (!isConnected || !isCorrectNetwork) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet and switch to Core Testnet",
        variant: "destructive",
      })
      return
    }

    if (!collateralToken || !borrowToken || !borrowAmount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (Number.parseFloat(borrowAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid borrow amount",
        variant: "destructive",
      })
      return
    }

    try {
      // TODO: Implement contract interaction
      // const contract = new ethers.Contract(contractAddress, abi, provider.getSigner())
      // await contract.borrow(
      //   collateralTokenAddress,
      //   borrowTokenAddress,
      //   ethers.parseUnits(borrowAmount, 18),
      //   ethers.parseUnits(collateralRequired, 18)
      // )

      toast({
        title: "Borrow Successful",
        description: `Successfully borrowed ${borrowAmount} ${borrowToken}`,
      })

      // Reset form
      setCollateralToken("")
      setBorrowToken("")
      setBorrowAmount("")
    } catch (error) {
      console.error("Borrow failed:", error)
      toast({
        title: "Borrow Failed",
        description: "Transaction failed. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Borrow Tokens</h1>
        <p className="text-gray-600">
          Borrow tokens by providing collateral. Maintain a healthy collateralization ratio to avoid liquidation.
        </p>
      </div>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingDown className="h-5 w-5 text-primary" />
            <span>Create Loan</span>
          </CardTitle>
          <CardDescription>
            Select your collateral and borrow tokens, then specify the amount you want to borrow.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Collateral Token Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Collateral Token</label>
            <Select value={collateralToken} onValueChange={setCollateralToken}>
              <SelectTrigger>
                <SelectValue placeholder="Select collateral token" />
              </SelectTrigger>
              <SelectContent>
                {tokens.map((token) => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    <div className="flex items-center space-x-2">
                      <span>{token.logo}</span>
                      <span>{token.symbol}</span>
                      <span className="text-gray-500">- {token.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Borrow Token Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Borrow Token</label>
            <Select value={borrowToken} onValueChange={setBorrowToken}>
              <SelectTrigger>
                <SelectValue placeholder="Select token to borrow" />
              </SelectTrigger>
              <SelectContent>
                {tokens.map((token) => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    <div className="flex items-center space-x-2">
                      <span>{token.logo}</span>
                      <span>{token.symbol}</span>
                      <span className="text-gray-500">- {token.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Borrow Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Borrow Amount</label>
            <Input
              type="number"
              placeholder="0.00"
              value={borrowAmount}
              onChange={(e) => setBorrowAmount(e.target.value)}
            />
          </div>

          {/* Loan Details */}
          {borrowAmount && collateralToken && borrowToken && (
            <Card className="bg-gray-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Calculator className="h-4 w-4" />
                  <span>Loan Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Collateral Required (150%)</span>
                  <span className="font-medium">
                    {collateralRequired} {collateralToken}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Liquidation Threshold</span>
                  <span className="font-medium">
                    {liquidationPrice} {collateralToken}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Interest Rate</span>
                  <Badge variant="secondary">12.5% APR</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Loan-to-Value Ratio</span>
                  <span className="font-medium">66.67%</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warning */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-yellow-800 font-medium text-sm">Liquidation Risk Warning</p>
                  <p className="text-yellow-700 text-sm">
                    If your collateral value falls below 133% of your borrowed amount, your position may be liquidated.
                    Monitor your loan regularly.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Borrow Button */}
          <Button
            onClick={handleBorrow}
            className="w-full bg-primary hover:bg-primary/90 text-black"
            disabled={!isConnected || !isCorrectNetwork || !collateralToken || !borrowToken || !borrowAmount}
          >
            {!isConnected ? "Connect Wallet" : !isCorrectNetwork ? "Switch to Core Testnet" : "Borrow Tokens"}
          </Button>
        </CardContent>
      </Card>

      {(!isConnected || !isCorrectNetwork) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-yellow-800 font-medium">
                {!isConnected ? "Connect your wallet to start borrowing" : "Switch to Core Testnet to continue"}
              </p>
              <p className="text-yellow-600 text-sm">
                Make sure you're connected to the Core Testnet to interact with the protocol.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
