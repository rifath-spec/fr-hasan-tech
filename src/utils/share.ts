import { OfferItem } from '../types';

export interface ShareOptions {
  title: string;
  text: string;
  url: string;
  image?: string;
}

/**
 * Constructs a fully qualified public share URL for an offer
 */
export const getOfferShareUrl = (offerId: string): string => {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    return `${origin}/offers?id=${encodeURIComponent(offerId)}`;
  }
  return `https://frhasantech.com/offers?id=${encodeURIComponent(offerId)}`;
};

/**
 * Builds formatted text for messaging and social media posts
 */
export const getOfferShareText = (offer: OfferItem, shopName = 'FR.HASAN TECH'): string => {
  const priceText = offer.offerPrice 
    ? `\n🔥 Special Price: LKR ${offer.offerPrice.toLocaleString()}${offer.originalPrice ? ` (Regular: LKR ${offer.originalPrice.toLocaleString()})` : ''}`
    : '';
  
  const discountText = offer.discountPercentage ? ` [${offer.discountPercentage}% OFF]` : (offer.badge ? ` [${offer.badge}]` : '');
  const validityText = offer.validUntil ? `\n⏳ Valid Until: ${offer.validUntil}` : '';
  const featuresText = offer.features && offer.features.length > 0 
    ? `\n\nHighlights:\n${offer.features.map(f => `• ${f}`).join('\n')}`
    : '';

  return `🎉 *${offer.title}*${discountText}${priceText}\n\n${offer.shortDescription || offer.description}${featuresText}${validityText}\n\n📍 Available at ${shopName} (529, Siraj Nagar, Thampalagamam)`;
};

/**
 * Share via WhatsApp
 */
export const shareToWhatsApp = (offer: OfferItem, shopName?: string) => {
  const text = getOfferShareText(offer, shopName);
  const url = getOfferShareUrl(offer.id);
  const fullMessage = `${text}\n\n👉 View Offer Details: ${url}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullMessage)}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
};

/**
 * Direct Claim / Inquire about an offer on WhatsApp with FR.HASAN TECH
 */
export const claimOfferOnWhatsApp = (offer: OfferItem, whatsappNumber = '076 859 7800', shopName = 'FR.HASAN TECH') => {
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
  const formattedPhone = cleanNumber.startsWith('0') 
    ? '94' + cleanNumber.substring(1) 
    : cleanNumber.startsWith('94') ? cleanNumber : '94' + cleanNumber;

  const priceInfo = offer.offerPrice ? ` (LKR ${offer.offerPrice.toLocaleString()})` : '';
  const message = `Hello ${shopName}! I would like to claim the special offer: *${offer.title}*${priceInfo}.\n\nPlease let me know the availability and how to proceed. Thank you!`;
  const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Share via Facebook
 */
export const shareToFacebook = (offer: OfferItem) => {
  const url = getOfferShareUrl(offer.id);
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(offer.title + ' - ' + (offer.shortDescription || 'Special Offer at FR.HASAN TECH'))}`;
  window.open(fbUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
};

/**
 * Share via Twitter / X
 */
export const shareToTwitter = (offer: OfferItem) => {
  const url = getOfferShareUrl(offer.id);
  const text = `🎉 Special Deal: ${offer.title} ${offer.badge ? `[${offer.badge}]` : ''} at FR.HASAN TECH! Check it out:`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  window.open(twitterUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
};

/**
 * Share via Telegram
 */
export const shareToTelegram = (offer: OfferItem, shopName?: string) => {
  const url = getOfferShareUrl(offer.id);
  const text = getOfferShareText(offer, shopName);
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  window.open(telegramUrl, '_blank', 'noopener,noreferrer');
};

/**
 * Share via Native Web Share API (mobile phones, tablets)
 */
export const shareViaWebShare = async (offer: OfferItem, shopName?: string): Promise<boolean> => {
  const url = getOfferShareUrl(offer.id);
  const text = getOfferShareText(offer, shopName);

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: offer.title,
        text: text,
        url: url,
      });
      return true;
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Web Share failed:', err);
      }
      return false;
    }
  }
  return false;
};

/**
 * Copy Share Link to Clipboard
 */
export const copyOfferLink = async (offerId: string): Promise<boolean> => {
  const url = getOfferShareUrl(offerId);
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    }
    // Fallback for older environments
    const textarea = document.createElement('textarea');
    textarea.value = url;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (err) {
    console.error('Failed to copy link:', err);
    return false;
  }
};

export const copyOfferShareLink = copyOfferLink;
