import React, { useState } from 'react';
import { Share2, Check, Copy, MessageCircle, Twitter, Facebook } from 'lucide-react';

interface ShareButtonProps {
  content: {
    title: string;
    text: string;
    url: string;
  };
  variant?: 'icon' | 'button';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ 
  content, 
  variant = 'icon', 
  size = 'md',
  className = '' 
}) => {
  const [shareState, setShareState] = useState<'idle' | 'sharing' | 'copied' | 'menu'>('idle');

  const handleShare = async () => {
    setShareState('sharing');

    try {
      // Try native sharing first (mobile devices)
      if (navigator.share && navigator.canShare && navigator.canShare(content)) {
        await navigator.share(content);
        setShareState('idle');
        return;
      }
      
      // Fallback to clipboard
      await navigator.clipboard.writeText(content.text);
      setShareState('copied');
      
      // Reset state after 2 seconds
      setTimeout(() => {
        setShareState('idle');
      }, 2000);
      
    } catch (error) {
      console.error('Error sharing:', error);
      setShareState('idle');
    }
  };

  const handleSocialShare = (platform: string) => {
    const encodedText = encodeURIComponent(content.text);
    const encodedUrl = encodeURIComponent(content.url);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    
    setShareState('idle');
  };

  const getIcon = () => {
    switch (shareState) {
      case 'sharing':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'copied':
        return <Check className="h-4 w-4 text-green-500" />;
      default:
        return <Share2 className="h-4 w-4" />;
    }
  };

  const getButtonClass = () => {
    const sizeClasses = {
      sm: 'p-1.5',
      md: 'p-2',
      lg: 'p-3'
    };
    
    const baseClass = `${sizeClasses[size]} rounded-lg transition-all duration-200 flex items-center justify-center relative`;
    
    switch (shareState) {
      case 'sharing':
        return `${baseClass} bg-blue-50 cursor-wait text-blue-500`;
      case 'copied':
        return `${baseClass} bg-green-50 text-green-500`;
      case 'menu':
        return `${baseClass} bg-gray-100 text-gray-700`;
      default:
        return `${baseClass} hover:bg-gray-100 active:bg-gray-200 text-gray-500 hover:text-gray-700`;
    }
  };

  const getTooltip = () => {
    switch (shareState) {
      case 'copied':
        return 'Copied to clipboard!';
      case 'sharing':
        return 'Sharing...';
      default:
        return 'Share this';
    }
  };

  if (variant === 'button') {
    return (
      <div className="relative">
        <button
          onClick={() => setShareState(shareState === 'menu' ? 'idle' : 'menu')}
          className={`${getButtonClass()} ${className} px-3 sm:px-4 py-2 gap-1 sm:gap-2`}
          title={getTooltip()}
          disabled={shareState === 'sharing'}
        >
          {getIcon()}
          <span className="text-xs sm:text-sm font-medium">Share</span>
        </button>
        
        {shareState === 'menu' && (
          <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 min-w-40 sm:min-w-48">
            <button
              onClick={handleShare}
              className="w-full px-3 sm:px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 sm:gap-3"
            >
              <Copy className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
              <span className="text-xs sm:text-sm">Copy to clipboard</span>
            </button>
            
            <div className="border-t border-gray-100 my-1"></div>
            
            <button
              onClick={() => handleSocialShare('twitter')}
              className="w-full px-3 sm:px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 sm:gap-3"
            >
              <Twitter className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
              <span className="text-xs sm:text-sm">Share on Twitter</span>
            </button>
            
            <button
              onClick={() => handleSocialShare('facebook')}
              className="w-full px-3 sm:px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 sm:gap-3"
            >
              <Facebook className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
              <span className="text-xs sm:text-sm">Share on Facebook</span>
            </button>
            
            <button
              onClick={() => handleSocialShare('whatsapp')}
              className="w-full px-3 sm:px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 sm:gap-3"
            >
              <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
              <span className="text-xs sm:text-sm">Share on WhatsApp</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleShare}
      className={`${getButtonClass()} ${className}`}
      title={getTooltip()}
      disabled={shareState === 'sharing'}
    >
      {getIcon()}
    </button>
  );
};