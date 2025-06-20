import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'

interface AuthButtonProps {
  variant?: 'default' | 'header' | 'hero'
  showSignUp?: boolean
}

/**
 * Unified Authentication Button Component
 * 
 * Displays appropriate authentication UI based on user's sign-in status
 * and the specified variant for different contexts (header, hero, etc.)
 */
export const AuthButton = ({ variant = 'default', showSignUp = true }: AuthButtonProps) => {
  const getButtonStyles = () => {
    switch (variant) {
      case 'header':
        return {
          signIn: "text-gray-300 hover:text-white hover:bg-white/10 rounded-full px-6 py-2 transition-all duration-300",
          signUp: "bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] text-white rounded-full px-6 py-2 font-medium hover:shadow-lg hover:shadow-[#3ABCF7]/25 transition-all duration-300"
        }
      case 'hero':
        return {
          signIn: "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 rounded-full px-8 py-3 font-medium transition-all duration-300",
          signUp: "bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] text-white rounded-full px-8 py-3 font-medium hover:shadow-lg hover:shadow-[#3ABCF7]/25 transition-all duration-300 hover:scale-105"
        }
      default:
        return {
          signIn: "variant-outline",
          signUp: "bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] text-white hover:shadow-lg transition-all duration-300"
        }
    }
  }

  const styles = getButtonStyles()

  return (
    <>
      <SignedOut>
        <div className="flex items-center space-x-2">
          <SignInButton mode="modal">
            <Button
              variant={variant === 'default' ? 'outline' : 'ghost'}
              className={styles.signIn}
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
            >
              Sign In
            </Button>
          </SignInButton>
          {showSignUp && (
            <SignUpButton mode="modal">
              <Button
                className={styles.signUp}
                style={{ fontFamily: '"Space Grotesk", sans-serif' }}
              >
                Sign Up
              </Button>
            </SignUpButton>
          )}
        </div>
      </SignedOut>
      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-10 h-10 rounded-full border-2 border-gradient-to-r from-[#3ABCF7] to-[#8B2FF8]"
            }
          }}
        />
      </SignedIn>
    </>
  )
}

export default AuthButton
