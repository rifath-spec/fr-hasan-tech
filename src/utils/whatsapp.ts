/**
 * Formats a phone number for the WhatsApp API (E.164 format without leading + or 0).
 * Handles Sri Lankan domestic numbers (e.g. 076 859 7800 -> 94768597800) and general international numbers.
 */
export function formatWhatsAppNumber(phone: string): string {
  if (!phone) return '94768597800';
  
  // Strip all non-digit characters
  let cleaned = phone.replace(/[^0-9]/g, '');
  
  // If starts with 0 and is a standard Sri Lankan number (e.g. 0768597800 -> 94768597800)
  if (cleaned.startsWith('0')) {
    cleaned = '94' + cleaned.substring(1);
  } else if (cleaned.startsWith('94')) {
    // Already in international format without plus
    cleaned = cleaned;
  } else if (cleaned.length === 9 && !cleaned.startsWith('0')) {
    // 9 digits missing country code (e.g. 768597800)
    cleaned = '94' + cleaned;
  }
  
  return cleaned || '94768597800';
}

/**
 * Generates the direct WhatsApp chat link that directly opens the exact chat with the business
 */
export function getWhatsAppUrl(phone: string, message?: string): string {
  const formattedNumber = formatWhatsAppNumber(phone);
  const textParam = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${formattedNumber}${textParam}`;
}

/**
 * Opens WhatsApp directly to the exact conversation with the business
 */
export function openWhatsAppChat(phone: string, message?: string): void {
  const url = getWhatsAppUrl(phone, message);
  window.open(url, '_blank', 'noopener,noreferrer');
}
