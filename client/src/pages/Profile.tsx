import { useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { ArrowLeft, User, Mail, Calendar, Shield } from 'lucide-react'

/**
 * User Profile Page
 * 
 * Displays authenticated user information and account settings
 * Demonstrates how to use Clerk user data in protected routes
 */
const Profile = () => {
  const { user, isLoaded } = useUser()
  const navigate = useNavigate()

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] rounded-full flex items-center justify-center animate-pulse mx-auto">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Loading Profile...</h3>
            <p className="text-gray-400">Fetching your account information</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold text-white mb-2">Profile Not Found</h3>
          <p className="text-gray-400">Unable to load your profile information</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const userTier = user.publicMetadata?.tier || user.privateMetadata?.tier || 'free'
  const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background gradient elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-30">
        <div className="absolute top-[-300px] right-[-300px] w-[600px] h-[600px] rounded-full bg-gradient-to-r from-purple-700/30 to-blue-700/20 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] rounded-full bg-gradient-to-r from-cyan-700/20 to-teal-700/10 blur-[100px] animate-pulse" style={{ animationDuration: '10s' }}></div>
      </div>

      {/* Header */}
      <motion.header
        className="relative z-10 bg-black/60 backdrop-blur-xl border-b border-white/10 p-4"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="text-gray-400"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-white/20"></div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8]"
                style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
              User Profile
            </h1>
          </div>
        </div>
      </motion.header>

      {/* Profile Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Profile Overview Card */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8]"
                         style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Avatar and Basic Info */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] rounded-full flex items-center justify-center">
                    {user.imageUrl ? (
                      <img 
                        src={user.imageUrl} 
                        alt="Profile" 
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-white" />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user.username || 'User'}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400 capitalize">{userTier} Plan</span>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <Mail className="w-5 h-5 text-[#3ABCF7]" />
                    <div>
                      <p className="text-sm text-gray-400">Email Address</p>
                      <p className="text-white">{user.emailAddresses[0]?.emailAddress || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <User className="w-5 h-5 text-[#3ABCF7]" />
                    <div>
                      <p className="text-sm text-gray-400">Username</p>
                      <p className="text-white">{user.username || 'Not set'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <Calendar className="w-5 h-5 text-[#3ABCF7]" />
                    <div>
                      <p className="text-sm text-gray-400">Member Since</p>
                      <p className="text-white">{joinDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <Shield className="w-5 h-5 text-[#3ABCF7]" />
                    <div>
                      <p className="text-sm text-gray-400">Account Tier</p>
                      <p className="text-white capitalize">{userTier}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => window.open('/user-profile', '_blank')}
                  className="bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] text-white hover:shadow-lg transition-all duration-300"
                >
                  Edit Profile
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default Profile
