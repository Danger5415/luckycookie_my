import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Gift, Mail, User, Phone, Save, X, CheckCircle, CreditCard, Smartphone } from 'lucide-react';

interface FreePrizeClaimFormProps {
  crackHistoryId: string;
  prizeName: string;
  prizeValue: number;
  onClose: () => void;
  onSubmit: (claimData: FreePrizeClaimData) => void;
}

export interface FreePrizeClaimData {
  claim_type: string;
  account_email: string;
  account_username?: string;
  phone_number?: string;
  platform_details: any;
  special_instructions?: string;
}

export const FreePrizeClaimForm: React.FC<FreePrizeClaimFormProps> = ({
  crackHistoryId,
  prizeName,
  prizeValue,
  onClose,
  onSubmit
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FreePrizeClaimData>({
    claim_type: getClaimTypeFromPrizeName(prizeName),
    account_email: user?.email || '',
    account_username: '',
    phone_number: '',
    platform_details: {},
    special_instructions: ''
  });

  const [errors, setErrors] = useState<Partial<FreePrizeClaimData>>({});

  function getClaimTypeFromPrizeName(name: string): string {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('amazon')) return 'amazon_gift_card';
    if (lowerName.includes('starbucks')) return 'starbucks_gift_card';
    if (lowerName.includes('itunes') || lowerName.includes('apple')) return 'itunes_gift_card';
    if (lowerName.includes('google play')) return 'google_play_credit';
    if (lowerName.includes('paypal')) return 'paypal_credit';
    return 'other';
  }

  const claimTypes = [
    { value: 'amazon_gift_card', label: 'Amazon Gift Card', icon: '🛒', requiresUsername: false },
    { value: 'starbucks_gift_card', label: 'Starbucks Gift Card', icon: '☕', requiresUsername: false },
    { value: 'itunes_gift_card', label: 'iTunes/Apple Gift Card', icon: '🍎', requiresUsername: false },
    { value: 'google_play_credit', label: 'Google Play Credit', icon: '📱', requiresUsername: true },
    { value: 'paypal_credit', label: 'PayPal Credit', icon: '💳', requiresUsername: false },
    { value: 'other', label: 'Other', icon: '🎁', requiresUsername: false }
  ];

  const selectedClaimType = claimTypes.find(type => type.value === formData.claim_type);

  const validateForm = (): boolean => {
    const newErrors: Partial<FreePrizeClaimData> = {};

    if (!formData.account_email.trim()) {
      newErrors.account_email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.account_email)) {
        newErrors.account_email = 'Please enter a valid email address';
      }
    }

    if (selectedClaimType?.requiresUsername && !formData.account_username?.trim()) {
      newErrors.account_username = 'Username is required for this platform';
    }

    if (formData.phone_number && formData.phone_number.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(formData.phone_number.replace(/[\s\-\(\)]/g, ''))) {
        newErrors.phone_number = 'Please enter a valid phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Save claim information to database
      const { error } = await supabase
        .from('free_prize_claims')
        .insert({
          user_id: user?.id,
          crack_history_id: crackHistoryId,
          prize_name: prizeName,
          prize_value: prizeValue,
          claim_type: formData.claim_type,
          account_email: formData.account_email,
          account_username: formData.account_username || null,
          phone_number: formData.phone_number || null,
          platform_details: formData.platform_details,
          special_instructions: formData.special_instructions || null,
          status: 'pending'
        });

      if (error) throw error;

      onSubmit(formData);
    } catch (error) {
      console.error('Error saving claim information:', error);
      setErrors({ account_email: 'Failed to save claim information. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FreePrizeClaimData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleClaimTypeChange = (claimType: string) => {
    setFormData(prev => ({ 
      ...prev, 
      claim_type: claimType,
      account_username: claimTypes.find(t => t.value === claimType)?.requiresUsername ? prev.account_username : ''
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-in fade-in duration-300">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mr-2 sm:mr-3" />
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-gray-800">Claim Your Prize! 🎉</h2>
                <p className="text-sm sm:text-base text-gray-600">🎁 {prizeName} (${prizeValue})</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Prize Type Selection */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-500" />
              Prize Type
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {claimTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleClaimTypeChange(type.value)}
                  className={`p-2 sm:p-3 rounded-lg border-2 transition-all text-left ${
                    formData.claim_type === type.value
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-xl sm:text-2xl mr-2 sm:mr-3">{type.icon}</span>
                    <span className="text-sm sm:text-base font-medium">{type.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Account Information */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
              <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-purple-500" />
              Account Information
            </h3>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.account_email}
                    onChange={(e) => handleInputChange('account_email', e.target.value)}
                    className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      errors.account_email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="your.email@example.com"
                  />
                </div>
                {errors.account_email && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.account_email}</p>
                )}
                <p className="text-gray-500 text-xs sm:text-sm mt-1">
                  This email will be used to deliver your {selectedClaimType?.label.toLowerCase()}
                </p>
              </div>

              {selectedClaimType?.requiresUsername && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Username/Account ID *
                  </label>
                  <div className="relative">
                    <User className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.account_username}
                      onChange={(e) => handleInputChange('account_username', e.target.value)}
                      className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                        errors.account_username ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Your username or account ID"
                    />
                  </div>
                  {errors.account_username && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.account_username}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      errors.phone_number ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                {errors.phone_number && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.phone_number}</p>
                )}
                <p className="text-gray-500 text-xs sm:text-sm mt-1">
                  For verification purposes if needed
                </p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  value={formData.special_instructions}
                  onChange={(e) => handleInputChange('special_instructions', e.target.value)}
                  rows={2}
                  className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Any special instructions or preferences..."
                />
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-start">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-medium text-green-800 mb-1">Prize Delivery Information</h4>
                <p className="text-xs sm:text-sm text-green-700">
                  Our team will process your claim within 24-48 hours. You'll receive your {selectedClaimType?.label.toLowerCase()} 
                  via email. Please ensure your email address is correct and check your spam folder.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Claim Prize
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};