import React, { memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';
import { AWSCredentialsModalProps } from '@/types/dashboard';

/**
 * AWS Credentials Modal component for connection form
 * Memoized for performance optimization
 */
const AWSCredentialsModal = memo<AWSCredentialsModalProps>(({
  isOpen,
  onClose,
  onSubmit,
  credentials,
  onCredentialsChange,
  connectionStatus,
  error,
  awsDataError
}) => {
  const handleAccessKeyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onCredentialsChange({
      ...credentials,
      accessKey: e.target.value
    });
  }, [credentials, onCredentialsChange]);

  const handleSecretKeyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onCredentialsChange({
      ...credentials,
      secretKey: e.target.value
    });
  }, [credentials, onCredentialsChange]);

  const handleRegionChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onCredentialsChange({
      ...credentials,
      region: e.target.value
    });
  }, [credentials, onCredentialsChange]);

  const hasError = error || awsDataError;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-900 border border-white/20 rounded-2xl p-6 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <ModalHeader />
            
            {hasError && (
              <ErrorDisplay error={error || awsDataError} />
            )}

            <CredentialsForm
              credentials={credentials}
              connectionStatus={connectionStatus}
              onSubmit={onSubmit}
              onClose={onClose}
              onAccessKeyChange={handleAccessKeyChange}
              onSecretKeyChange={handleSecretKeyChange}
              onRegionChange={handleRegionChange}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// Memoized Modal Header component
const ModalHeader = memo(() => (
  <h3 className="text-xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8]"
      style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
    Connect AWS Account
  </h3>
));

// Memoized Error Display component
const ErrorDisplay = memo<{ error: string | null }>(({ error }) => (
  <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg mb-4">
    <div className="flex items-center space-x-2">
      <AlertCircle className="w-4 h-4 text-red-500" />
      <span className="text-red-400 text-sm">{error}</span>
    </div>
  </div>
));

// Memoized Credentials Form component
const CredentialsForm = memo<{
  credentials: any;
  connectionStatus: string;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onAccessKeyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSecretKeyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRegionChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}>(({
  credentials,
  connectionStatus,
  onSubmit,
  onClose,
  onAccessKeyChange,
  onSecretKeyChange,
  onRegionChange
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <AccessKeyField
      value={credentials.accessKey}
      onChange={onAccessKeyChange}
    />
    
    <SecretKeyField
      value={credentials.secretKey}
      onChange={onSecretKeyChange}
    />
    
    <RegionField
      value={credentials.region}
      onChange={onRegionChange}
    />
    
    <FormActions
      connectionStatus={connectionStatus}
      onClose={onClose}
    />
  </form>
));

// Memoized Access Key Field component
const AccessKeyField = memo<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}>(({ value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">
      AWS Access Key ID
    </label>
    <Input
      type="text"
      value={value}
      onChange={onChange}
      placeholder="AKIA..."
      className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-lg"
      required
    />
  </div>
));

// Memoized Secret Key Field component
const SecretKeyField = memo<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}>(({ value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">
      AWS Secret Access Key
    </label>
    <Input
      type="password"
      value={value}
      onChange={onChange}
      placeholder="Enter your secret key"
      className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-lg"
      required
    />
  </div>
));

// Memoized Region Field component
const RegionField = memo<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}>(({ value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">
      AWS Region
    </label>
    <select
      value={value}
      onChange={onChange}
      className="w-full bg-gray-800 border border-white/20 text-white rounded-lg p-2 focus:border-[#3ABCF7] focus:ring-1 focus:ring-[#3ABCF7]"
    >
      <option value="us-east-1" className="bg-gray-800 text-white">US East (N. Virginia)</option>
      <option value="us-west-2" className="bg-gray-800 text-white">US West (Oregon)</option>
      <option value="eu-west-1" className="bg-gray-800 text-white">Europe (Ireland)</option>
      <option value="ap-southeast-1" className="bg-gray-800 text-white">Asia Pacific (Singapore)</option>
    </select>
  </div>
));

// Memoized Form Actions component
const FormActions = memo<{
  connectionStatus: string;
  onClose: () => void;
}>(({ connectionStatus, onClose }) => (
  <div className="flex space-x-3 pt-4">
    <Button
      type="button"
      variant="outline"
      onClick={onClose}
      className="flex-1 border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent"
    >
      Cancel
    </Button>
    <Button
      type="submit"
      disabled={connectionStatus === 'connecting'}
      className="flex-1 bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] text-white"
    >
      {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect'}
    </Button>
  </div>
));

AWSCredentialsModal.displayName = 'AWSCredentialsModal';
ModalHeader.displayName = 'ModalHeader';
ErrorDisplay.displayName = 'ErrorDisplay';
CredentialsForm.displayName = 'CredentialsForm';
AccessKeyField.displayName = 'AccessKeyField';
SecretKeyField.displayName = 'SecretKeyField';
RegionField.displayName = 'RegionField';
FormActions.displayName = 'FormActions';

export default AWSCredentialsModal;
