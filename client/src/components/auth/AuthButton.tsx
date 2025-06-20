import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'

interface AuthButtonProps {
  variant?: 'default' | 'header' | 'hero'
}

/**
 * Unified Authentication Button Component
 *
 * Displays appropriate authentication UI based on user's sign-in status
 * and the specified variant for different contexts (header, hero, etc.)
 */
export const AuthButton = ({ variant = 'default' }: AuthButtonProps) => {
  const getButtonStyles = () => {
    switch (variant) {
      case 'header':
        return "text-gray-300 hover:text-white hover:bg-white/10 rounded-full px-6 py-2 transition-all duration-300"
      case 'hero':
        return "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 rounded-full px-8 py-3 font-medium transition-all duration-300"
      default:
        return "variant-outline"
    }
  }

  const styles = getButtonStyles()

  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <Button
            variant={variant === 'default' ? 'outline' : 'ghost'}
            className={styles}
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            Sign In
          </Button>
        </SignInButton>
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
