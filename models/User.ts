import mongoose, { Schema, Model } from 'mongoose';
import { IUser } from '@/types';

export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);


// lib/auth-utils.ts

/**
 * Hashes a password using Web Crypto PBKDF2 (SHA-256).
 * Safe for both Node.js and Edge runtimes.
 */
UserSchema.methods.hashPassword = async function (password: string): Promise<string> {
  const iterations = 100000;
  const saltBytes = crypto.getRandomValues(new Uint8Array(16) as Uint8Array<ArrayBuffer>);

  const toBase64 = (b: Uint8Array) => {
    let s = '';
    for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
    return btoa(s);
  };

  const derive = async (password: string, salt: Uint8Array<ArrayBuffer>, iter: number) => {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', 
      enc.encode(password), 
      { name: 'PBKDF2' }, 
      false, 
      ['deriveBits']
    );
    const derived = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, 
      key, 
      256
    );
    return new Uint8Array(derived) as Uint8Array<ArrayBuffer>;
  };

  const hashBytes = await derive(password, saltBytes, iterations);
  const saltB64 = toBase64(saltBytes);
  const hashB64 = toBase64(hashBytes);

  // Format: pbkdf2_sha256$<iterations>$<salt_b64>$<hash_b64>
  return `pbkdf2_sha256$${iterations}$${saltB64}$${hashB64}`;
}

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    if (!this.password || typeof this.password !== 'string') return false;
    const parts = this.password.split('$');
    if (parts.length !== 4) return false;
    const [algo, iterationsStr, saltB64, hashB64] = parts;
    if (!algo.startsWith('pbkdf2_sha256')) return false;
    const iterations = parseInt(iterationsStr, 10);

    const fromBase64 = (b64: string): Uint8Array<ArrayBuffer> => {
      const str = atob(b64);
      const u = new Uint8Array(str.length) as Uint8Array<ArrayBuffer>;
      for (let i = 0; i < str.length; i++) u[i] = str.charCodeAt(i);
      return u;
    };

    const salt = fromBase64(saltB64);

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(candidatePassword), { name: 'PBKDF2' }, false, ['deriveBits']);
    const derived = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, key, 256);
    const derivedBytes = new Uint8Array(derived);

    const expected = fromBase64(hashB64);
    if (derivedBytes.length !== expected.length) return false;

    // Constant-time comparison
    let diff = 0;
    for (let i = 0; i < derivedBytes.length; i++) diff |= derivedBytes[i] ^ expected[i];
    return diff === 0;
  } catch (err) {
    console.error('Password comparison error:', err);
    return false;
  }
};

const User: Model<IUserDocument> = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

export default User;

