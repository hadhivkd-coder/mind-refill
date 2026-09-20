import crypto from "crypto";

const SCRYPT_PARAMS = {
  N: 16384,
  r: 8,
  p: 1,
  keyLen: 64,
};

export class PasswordService {
  /**
   * Hashes a password using scrypt with a unique cryptographically secure salt.
   * Format: scrypt:<saltHex>:<keyHex>
   */
  static async hash(password: string): Promise<string> {
    if (!password || password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(16).toString("hex");
      crypto.scrypt(
        password,
        salt,
        SCRYPT_PARAMS.keyLen,
        { N: SCRYPT_PARAMS.N, r: SCRYPT_PARAMS.r, p: SCRYPT_PARAMS.p },
        (err, derivedKey) => {
          if (err) return reject(err);
          resolve(`scrypt:${salt}:${derivedKey.toString("hex")}`);
        }
      );
    });
  }

  /**
   * Constant-time comparison between plaintext password and stored scrypt hash.
   */
  static async verify(password: string, storedHash: string): Promise<boolean> {
    if (!password || !storedHash) return false;

    const parts = storedHash.split(":");
    if (parts.length !== 3 || parts[0] !== "scrypt") {
      return false;
    }

    const [, salt, expectedKeyHex] = parts;
    const expectedKey = Buffer.from(expectedKeyHex, "hex");

    return new Promise((resolve) => {
      crypto.scrypt(
        password,
        salt,
        expectedKey.length,
        { N: SCRYPT_PARAMS.N, r: SCRYPT_PARAMS.r, p: SCRYPT_PARAMS.p },
        (err, derivedKey) => {
          if (err) return resolve(false);
          try {
            resolve(crypto.timingSafeEqual(expectedKey, derivedKey));
          } catch {
            resolve(false);
          }
        }
      );
    });
  }
}
