import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_32_char_key_for_demo_only!';
const ALGORITHM = 'aes-256-cbc';

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(encryptedText: string): string {
  const textParts = encryptedText.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encrypted = textParts.join(':');
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export function encryptCredentials(credentials: any): any {
  if (!credentials) return credentials;
  
  const encrypted: any = {};
  for (const [portal, creds] of Object.entries(credentials)) {
    if (creds && typeof creds === 'object' && 'username' in creds && 'password' in creds) {
      encrypted[portal] = {
        username: (creds as any).username,
        password: encrypt((creds as any).password)
      };
    }
  }
  return encrypted;
}

export function decryptCredentials(credentials: any): any {
  if (!credentials) return credentials;
  
  const decrypted: any = {};
  for (const [portal, creds] of Object.entries(credentials)) {
    if (creds && typeof creds === 'object' && 'username' in creds && 'password' in creds) {
      decrypted[portal] = {
        username: (creds as any).username,
        password: decrypt((creds as any).password)
      };
    }
  }
  return decrypted;
}
