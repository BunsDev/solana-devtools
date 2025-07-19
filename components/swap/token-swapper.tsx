"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  Zap,
  ArrowUpDown,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  ExternalLink,
  TrendingUp,
  Clock,
} from "lucide-react"

interface Token {
  symbol: string
  name: string
  balance: string
  price: number
  logo: string
}

interface SwapRoute {
  dex: string
  price: number
  priceImpact: number
  fee: number
  estimatedOutput: number
}

export function TokenSwapper() {
  const [fromToken, setFromToken] = useState("SOL")
  const [toToken, setToToken] = useState("USDC")
  const [fromAmount, setFromAmount] = useState("")
  const [slippage, setSlippage] = useState([0.5])
  const [isLoading, setIsLoading] = useState(false)
  const [transaction, setTransaction] = useState<{
    status: "success" | "error" | null
    hash?: string
    message?: string
  }>({ status: null })

  const availableTokens: Token[] = [
    { symbol: "SOL", name: "Solana", balance: "45.67", price: 180.34, logo: "/placeholder.svg?height=32&width=32" },
    { symbol: "USDC", name: "USD Coin", balance: "2500.00", price: 1.0, logo: "/placeholder.svg?height=32&width=32" },
    { symbol: "RAY", name: "Raydium", balance: "1250.00", price: 1.5, logo: "/placeholder.svg?height=32&width=32" },
    { symbol: "ORCA", name: "Orca", balance: "890.45", price: 0.267, logo: "/placeholder.svg?height=32&width=32" },
    { symbol: "SRM", name: "Serum", balance: "2340.12", price: 0.045, logo: "/placeholder.svg?height=32&width=32" },
  ]

  const swapRoutes: SwapRoute[] = [
    { dex: "Raydium", price: 180.25, priceImpact: 0.12, fee: 0.25, estimatedOutput: 0 },
    { dex: "Orca", price: 180.18, priceImpact: 0.08, fee: 0.3, estimatedOutput: 0 },
    { dex: "Serum", price: 180.31, priceImpact: 0.15, fee: 0.22, estimatedOutput: 0 },
  ]

  const fromTokenData = availableTokens.find((t) => t.symbol === fromToken)
  const toTokenData = availableTokens.find((t) => t.symbol === toToken)
  const bestRoute = swapRoutes.reduce((best, current) => (current.price > best.price ? current : best))

  const calculateOutput = () => {
    if (!fromAmount || !fromTokenData || !toTokenData) return "0"
    const amount = Number.parseFloat(fromAmount)
    const output = (amount * fromTokenData.price) / toTokenData.price
    return output.toFixed(6)
  }

  const handleSwap = async () => {
    setIsLoading(true)
    setTransaction({ status: null })

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000))

      setTransaction({
        status: "success",
        hash: "4Rs8n4Z9qL6vX3tE7uI5oP2sA8dF4gH9jK6lM3nQ8rT2vU7xZ5yB3cD6e",
        message: `Successfully swapped ${fromAmount} ${fromToken} for ${calculateOutput()} ${toToken}`,
      })

      // Reset form
      setFromAmount("")
    } catch (error) {
      setTransaction({
        status: "error",
        message: "Swap failed. Please check your inputs and try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const swapTokens = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
    setFromAmount("")
  }

  const isFormValid = fromAmount && Number.parseFloat(fromAmount) > 0 && fromToken !== toToken

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Zap className="w-6 h-6" />
        <h2 className="text-2xl font-bold">Token Swapper</h2>
        <Badge variant="secondary">Multi-DEX Aggregator</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Swap Interface */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Swap Tokens</CardTitle>
              <CardDescription>Exchange tokens at the best available rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* From Token */}
              <div className="space-y-2">
                <Label>From</Label>
                <div className="flex gap-2">
                  <Select value={fromToken} onValueChange={setFromToken}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTokens.map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          <div className="flex items-center gap-2">
                            <img
                              src={token.logo || "/placeholder.svg"}
                              alt={token.name}
                              className="w-4 h-4 rounded-full"
                            />
                            {token.symbol}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={() => fromTokenData && setFromAmount(fromTokenData.balance)}>
                    Max
                  </Button>
                </div>
                {fromTokenData && (
                  <p className="text-sm text-muted-foreground">
                    Balance: {fromTokenData.balance} {fromToken} ($
                    {(Number.parseFloat(fromTokenData.balance) * fromTokenData.price).toLocaleString()})
                  </p>
                )}
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <Button variant="ghost" size="sm" onClick={swapTokens}>
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
              </div>

              {/* To Token */}
              <div className="space-y-2">
                <Label>To</Label>
                <div className="flex gap-2">
                  <Select value={toToken} onValueChange={setToToken}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTokens.map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          <div className="flex items-center gap-2">
                            <img
                              src={token.logo || "/placeholder.svg"}
                              alt={token.name}
                              className="w-4 h-4 rounded-full"
                            />
                            {token.symbol}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="text"
                    placeholder="0.00"
                    value={calculateOutput()}
                    readOnly
                    className="flex-1 bg-gray-50"
                  />
                </div>
                {toTokenData && (
                  <p className="text-sm text-muted-foreground">
                    Balance: {toTokenData.balance} {toToken} ($
                    {(Number.parseFloat(toTokenData.balance) * toTokenData.price).toLocaleString()})
                  </p>
                )}
              </div>

              {/* Slippage Settings */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Slippage Tolerance</Label>
                  <span className="text-sm font-medium">{slippage[0]}%</span>
                </div>
                <Slider value={slippage} onValueChange={setSlippage} max={5} min={0.1} step={0.1} className="w-full" />
                <div className="flex gap-2">
                  {[0.1, 0.5, 1.0, 3.0].map((value) => (
                    <Button
                      key={value}
                      variant={slippage[0] === value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSlippage([value])}
                    >
                      {value}%
                    </Button>
                  ))}
                </div>
              </div>

              <Button onClick={handleSwap} disabled={!isFormValid || isLoading} className="w-full" size="lg">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Swapping...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Swap Tokens
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Swap Details */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Best Route
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">DEX</span>
                <Badge variant="secondary">{bestRoute.dex}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rate</span>
                <span className="text-sm font-medium">
                  1 {fromToken} = {bestRoute.price.toFixed(2)} {toToken}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Price Impact</span>
                <span
                  className={`text-sm font-medium ${bestRoute.priceImpact > 1 ? "text-red-500" : "text-green-500"}`}
                >
                  {bestRoute.priceImpact}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Trading Fee</span>
                <span className="text-sm font-medium">{bestRoute.fee}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Transaction Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Network Fee</span>
                <span className="text-sm font-medium">~0.000005 SOL</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Priority Fee</span>
                <span className="text-sm font-medium">0.000001 SOL</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estimated Time</span>
                <span className="text-sm font-medium">~2 seconds</span>
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-sm font-medium">Total Cost</span>
                <span className="text-sm font-medium">~0.000006 SOL</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Routes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {swapRoutes.map((route, index) => (
                <div key={route.dex} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${index === 0 ? "bg-green-500" : "bg-gray-300"}`}></div>
                    <span className="text-sm font-medium">{route.dex}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{route.price.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{route.priceImpact}% impact</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transaction Status */}
      {transaction.status && (
        <Alert
          className={transaction.status === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
        >
          {transaction.status === "success" ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className="flex items-center justify-between">
            <span>{transaction.message}</span>
            {transaction.hash && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(transaction.hash!)}>
                  <Copy className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
