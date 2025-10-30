"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Brain, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [focusedField, setFocusedField] = useState<string | null>(null)
  
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    setError("")
    
    // Validate form
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    setIsLoading(true)
    
    try {
      await login(email, password)
      router.push("/dashboard") // Redirect to dashboard on successful login
    } catch (error: any) {
      setError(error.message || "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-muted/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 left-20 w-96 h-96 bg-muted/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-1000" />
              <div className="relative bg-card p-3 rounded-lg border border-border premium-shadow">
                <Brain className="w-8 h-8 text-foreground" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-foreground mb-2">Cognify</h1>
          <p className="text-muted-foreground text-sm font-poppins font-light">Your intelligent personal memory assistant</p>
        </div>

        {/* Form Card */}
        <Card className=" border-border backdrop-blur-sm premium-shadow animate-slide-up">
          <div className="p-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                <p className="text-destructive text-sm font-poppins">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
      
              {/* Email Field */}
              <div className="space-y-2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <Label htmlFor="email" className="text-foreground text-sm font-poppins font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    className={`bg-muted/50 border-border text-foreground placeholder-muted-foreground font-poppins transition-all duration-300 ${
                      focusedField === "email"
                        ? "border-ring shadow-lg shadow-ring/10"
                        : "hover:border-muted-foreground"
                    }`}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <Label htmlFor="password" className="text-foreground text-sm font-poppins font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    className={`bg-muted/50 border-border text-foreground placeholder-muted-foreground font-poppins transition-all duration-300 ${
                      focusedField === "password"
                        ? "border-ring shadow-lg shadow-ring/10"
                        : "hover:border-muted-foreground"
                    }`}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-8 bg-primary hover:bg-primary/90 text-primary-foreground font-poppins font-medium tracking-wide transition-all duration-300 disabled:opacity-50 animate-fade-in premium-shadow"
                style={{ animationDelay: "0.4s" }}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6 animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-card text-muted-foreground font-poppins font-light">or</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <p
              className="text-center text-muted-foreground text-sm font-poppins font-light animate-fade-in"
              style={{ animationDelay: "0.6s" }}
            >
              Don't have an account?{" "}
              <button 
                type="button"
                onClick={() => router.push("/signup")}
                className="text-foreground hover:text-foreground/80 transition-colors duration-300 font-medium underline-offset-4 hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </Card>

        {/* Footer Text */}
        <p
          className="text-center text-muted-foreground text-xs font-poppins font-light mt-8 animate-fade-in"
          style={{ animationDelay: "0.7s" }}
        >
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
