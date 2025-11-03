import { customAlphabet } from 'nanoid';

// Generate a custom nanoid with only uppercase letters and numbers
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

export const generateReferralCode = (): string => {
  return nanoid();
};
