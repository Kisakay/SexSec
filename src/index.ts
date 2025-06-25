import crypto from 'node:crypto';
import fs from 'node:fs';

/**
 * Configuration options for encryption/decryption operations
 */
interface Options {
  /** The encryption algorithm to use (default: "aes-256-cbc") */
  algorithm: string;
  /** The encoding format for encrypted data (default: "hex") */
  encoding: BufferEncoding;
  /** The encryption key buffer */
  key: Buffer | null;
  /** The initialization vector length in bytes (default: 16) */
  ivLength: number;
}

/**
 * Global options object containing encryption settings
 */
let options: Options = {
  algorithm: "aes-256-cbc",
  encoding: "hex",
  key: null,
  ivLength: 16,
};

/**
 * Changes the encoding format used for encrypted data
 * @param encoding - The buffer encoding to use for encrypted data
 * @example
 * ```typescript
 * changeEncoding('base64');
 * changeEncoding('hex');
 * ```
 */
function changeEncoding(encoding: BufferEncoding): void {
  if (encoding) {
    options.encoding = encoding;
  } else {
    options.encoding = "hex";
  }
}

/**
 * Sets the encryption key by hashing the provided string with SHA-256
 * @param key - The string to be used as encryption key
 * @returns The generated key buffer
 * @throws {Error} When key is empty or undefined
 * @example
 * ```typescript
 * const keyBuffer = changeKey('mySecretPassword');
 * ```
 */
function changeKey(key: string): Buffer {
  if (key) {
    options.key = crypto.createHash("sha256").update(key).digest();
  } else {
    throw new Error("Key is required");
  }
  return options.key;
}

/**
 * Changes the initialization vector (IV) length
 * @param iv_length - The length of the IV in bytes
 * @throws {Error} When IV length is invalid or not provided
 * @throws {Error} When IV length is greater than 16 for AES algorithms
 * @example
 * ```typescript
 * changeIvLength(16); // Standard for AES
 * ```
 */
function changeIvLength(iv_length: number): void {
  if (iv_length) {
    if (iv_length > 16 && options.algorithm.startsWith("aes")) {
      throw new Error("IV length must be 16 for AES algorithms");
    }
    options.ivLength = iv_length;
  } else {
    throw new Error("IV length is required");
  }
}

/**
 * Decrypts a single character or string
 * @param char - The encrypted string to decrypt
 * @returns The decrypted string
 * @throws {Error} When no key is set
 * @example
 * ```typescript
 * changeKey('myPassword');
 * const decrypted = decryptChar('a1b2c3d4...');
 * ```
 */
function decryptChar(char: string): string {
  if (options.key) {
    const decipher = crypto.createDecipheriv(
      options.algorithm,
      options.key,
      Buffer.alloc(options.ivLength, 0)
    );
    const decrypted = decipher.update(char, options.encoding, "utf8");
    return decrypted + decipher.final("utf8");
  } else {
    throw new Error("Key is required");
  }
}

/**
 * Encrypts a single character or string
 * @param char - The string to encrypt
 * @returns The encrypted string in the configured encoding
 * @throws {Error} When no key is set
 * @example
 * ```typescript
 * changeKey('myPassword');
 * const encrypted = encryptChar('Hello World');
 * ```
 */
function encryptChar(char: string): string {
  if (options.key) {
    const cipher = crypto.createCipheriv(
      options.algorithm,
      options.key,
      Buffer.alloc(options.ivLength, 0)
    );
    const encrypted = cipher.update(char, "utf8", options.encoding);
    return encrypted + cipher.final(options.encoding);
  } else {
    throw new Error("Key is required");
  }
}

/**
 * Encrypts a file and saves it with a .sex extension
 * @param path - The path to the file to encrypt
 * @param force - Whether to delete the original file after successful encryption (default: false)
 * @returns Promise that resolves to the path of the encrypted file
 * @throws {Error} When no key is set
 * @throws {Error} When the file doesn't exist
 * @example
 * ```typescript
 * changeKey('myPassword');
 * const encryptedPath = await encryptFile('/path/to/file.txt', true);
 * console.log(`Encrypted file saved as: ${encryptedPath}`);
 * ```
 */
function encryptFile(path: string, force: boolean = false): Promise<string> {
  if (options.key) {
    if (!fs.existsSync(path)) {
      throw new Error("File does not exist");
    }

    const iv = crypto.randomBytes(options.ivLength);
    const cipher = crypto.createCipheriv(options.algorithm, options.key, iv);
    const readStream = fs.createReadStream(path);
    const outputPath = path + ".sex";
    const writeStream = fs.createWriteStream(outputPath);

    // Write the IV first
    writeStream.write(iv);

    // Return a Promise to handle async operations
    return new Promise<string>((resolve, reject) => {
      writeStream.on('error', reject);
      readStream.on('error', reject);

      readStream.pipe(cipher).pipe(writeStream);

      writeStream.on('finish', () => {
        // Delete original file only AFTER encryption is complete
        if (force) {
          try {
            fs.unlinkSync(path);
          } catch (err) {
            reject(err);
            return;
          }
        }
        resolve(outputPath);
      });
    });
  } else {
    throw new Error("Key is required");
  }
}

/**
 * Decrypts a file with .sex extension
 * @param path - The path to the encrypted file
 * @param force - Whether to delete the encrypted file after successful decryption (default: false)
 * @returns The path of the decrypted file
 * @throws {Error} When no key is set
 * @throws {Error} When the file doesn't exist
 * @example
 * ```typescript
 * changeKey('myPassword');
 * const decryptedPath = decryptFile('/path/to/file.txt.sex', true);
 * console.log(`Decrypted file saved as: ${decryptedPath}`);
 * ```
 */
function decryptFile(path: string, force: boolean = false): string {
  if (options.key) {
    if (!fs.existsSync(path)) {
      throw new Error("File does not exist");
    }

    const fileData = fs.readFileSync(path);
    const iv = fileData.subarray(0, options.ivLength);
    const encryptedData = fileData.subarray(options.ivLength);
    const decipher = crypto.createDecipheriv(options.algorithm, options.key, iv);
    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final()
    ]);
    const outputPath = path.replace(".sex", "");
    fs.writeFileSync(outputPath, decrypted);

    // Delete original file only AFTER successful decryption
    if (force) {
      fs.unlinkSync(path);
    }
    return outputPath;
  } else {
    throw new Error("Key is required");
  }
}

/**
 * Recursively encrypts all files in a directory
 * @param dir_path - The path to the directory to encrypt
 * @param force - Whether to delete original files after successful encryption (default: false)
 * @throws {Error} When the directory doesn't exist
 * @example
 * ```typescript
 * changeKey('myPassword');
 * await encryptDir('/path/to/directory', true);
 * console.log('All files in directory encrypted');
 * ```
 */
async function encryptDir(dir_path: string, force: boolean = false): Promise<void> {
  if (fs.existsSync(dir_path)) {
    if (fs.lstatSync(dir_path).isDirectory()) {
      const files = fs.readdirSync(dir_path);
      // Process files sequentially to avoid conflicts
      for (const file of files) {
        const file_path = dir_path + "/" + file;
        if (fs.lstatSync(file_path).isFile()) {
          await encryptFile(file_path, force);
        } else {
          await encryptDir(file_path, force);
        }
      }
    }
  } else {
    throw new Error("Directory does not exist");
  }
}

/**
 * Recursively decrypts all .sex files in a directory
 * @param dir_path - The path to the directory containing encrypted files
 * @param force - Whether to delete encrypted files after successful decryption (default: false)
 * @throws {Error} When the directory doesn't exist
 * @example
 * ```typescript
 * changeKey('myPassword');
 * await decryptDir('/path/to/directory', true);
 * console.log('All .sex files in directory decrypted');
 * ```
 */
async function decryptDir(dir_path: string, force: boolean = false): Promise<void> {
  if (fs.existsSync(dir_path)) {
    if (fs.lstatSync(dir_path).isDirectory()) {
      const files = fs.readdirSync(dir_path);
      // Process files sequentially
      for (const file of files) {
        const file_path = dir_path + "/" + file;
        if (fs.lstatSync(file_path).isFile()) {
          // Only decrypt files with .sex extension
          if (file.endsWith(".sex")) {
            decryptFile(file_path, force);
          }
        } else {
          await decryptDir(file_path, force);
        }
      }
    }
  } else {
    throw new Error("Directory does not exist");
  }
}

/**
 * SexSec - A comprehensive encryption/decryption library
 * 
 * This library provides functionality for:
 * - String/character encryption and decryption
 * - File encryption and decryption with .sex extension
 * - Directory recursive encryption and decryption
 * - Configurable encryption settings (algorithm, encoding, IV length)
 * 
 * @example
 * ```typescript
 * import { sexsec } from './sexsec';
 * 
 * // Set up encryption key
 * sexsec.changeKey('mySecretPassword');
 * 
 * // Encrypt a string
 * const encrypted = sexsec.encryptChar('Hello World');
 * const decrypted = sexsec.decryptChar(encrypted);
 * 
 * // Encrypt a file
 * await sexsec.encryptFile('/path/to/file.txt', true);
 * 
 * // Encrypt entire directory
 * await sexsec.encryptDir('/path/to/directory', false);
 * ```
 */
export const sexsec = {
  // Security configuration
  /** Change the encryption key */
  changeKey,
  /** Change the encoding format */
  changeEncoding,
  /** Change the IV length */
  changeIvLength,

  // Character/String operations
  /** Decrypt a character or string */
  decryptChar,
  /** Encrypt a character or string */
  encryptChar,

  // File operations
  /** Encrypt a single file */
  encryptFile,
  /** Decrypt a single file */
  decryptFile,

  // Directory operations
  /** Recursively encrypt all files in a directory */
  encryptDir,
  /** Recursively decrypt all .sex files in a directory */
  decryptDir,
};