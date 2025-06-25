# 🔐 SexSec

A powerful and flexible Node.js encryption/decryption library for files, directories, and strings using AES encryption.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

- 🔒 **File Encryption**: Encrypt individual files with `.sex` extension
- 📁 **Directory Encryption**: Recursively encrypt entire directories
- 🔤 **String Encryption**: Encrypt/decrypt individual strings or characters
- ⚙️ **Configurable**: Customizable algorithms, encoding formats, and IV lengths
- 🚀 **Async Support**: Promise-based file operations for better performance
- 🛡️ **Secure**: Uses industry-standard AES encryption with SHA-256 key derivation
- 📝 **TypeScript**: Full TypeScript support with comprehensive type definitions

## 🚀 Installation

```bash
npm install sexsec
# or
yarn add sexsec
# or
pnpm add sexsec
# or
bun add sexsec
```

## 📖 Quick Start

```typescript
import { sexsec } from 'sexsec';

// Set your encryption key
sexsec.changeKey('your-secret-password');

// Encrypt a string
const encrypted = sexsec.encryptChar('Hello, World!');
const decrypted = sexsec.decryptChar(encrypted);

console.log('Original:', 'Hello, World!');
console.log('Encrypted:', encrypted);
console.log('Decrypted:', decrypted);
```

## 🔧 Configuration

### Setting the Encryption Key

```typescript
// Set encryption key (required before any encryption/decryption)
const keyBuffer = sexsec.changeKey('your-secret-password');
```

### Changing Encoding Format

```typescript
// Available encodings: 'hex', 'base64', 'base64url', etc.
sexsec.changeEncoding('base64');
sexsec.changeEncoding('hex'); // default
```

### Adjusting IV Length

```typescript
// Set IV length (default: 16 bytes for AES)
sexsec.changeIvLength(16);
```

## 📝 API Reference

### Configuration Methods

#### `changeKey(key: string): Buffer`
Sets the encryption key by hashing the provided string with SHA-256.

**Parameters:**
- `key` - The string to be used as encryption key

**Returns:** The generated key buffer

**Throws:** Error when key is empty or undefined

#### `changeEncoding(encoding: BufferEncoding): void`
Changes the encoding format used for encrypted data.

**Parameters:**
- `encoding` - The buffer encoding to use ('hex', 'base64', etc.)

#### `changeIvLength(iv_length: number): void`
Changes the initialization vector (IV) length.

**Parameters:**
- `iv_length` - The length of the IV in bytes

**Throws:** Error when IV length is invalid or greater than 16 for AES algorithms

### String Operations

#### `encryptChar(char: string): string`
Encrypts a string or character.

**Parameters:**
- `char` - The string to encrypt

**Returns:** The encrypted string in the configured encoding

#### `decryptChar(char: string): string`
Decrypts an encrypted string.

**Parameters:**
- `char` - The encrypted string to decrypt

**Returns:** The decrypted string

### File Operations

#### `encryptFile(path: string, force?: boolean): Promise<string>`
Encrypts a file and saves it with a `.sex` extension.

**Parameters:**
- `path` - The path to the file to encrypt
- `force` - Whether to delete the original file after successful encryption (default: false)

**Returns:** Promise that resolves to the path of the encrypted file

#### `decryptFile(path: string, force?: boolean): string`
Decrypts a file with `.sex` extension.

**Parameters:**
- `path` - The path to the encrypted file
- `force` - Whether to delete the encrypted file after successful decryption (default: false)

**Returns:** The path of the decrypted file

### Directory Operations

#### `encryptDir(dir_path: string, force?: boolean): Promise<void>`
Recursively encrypts all files in a directory.

**Parameters:**
- `dir_path` - The path to the directory to encrypt
- `force` - Whether to delete original files after successful encryption (default: false)

#### `decryptDir(dir_path: string, force?: boolean): Promise<void>`
Recursively decrypts all `.sex` files in a directory.

**Parameters:**
- `dir_path` - The path to the directory containing encrypted files
- `force` - Whether to delete encrypted files after successful decryption (default: false)

## 💡 Usage Examples

### String Encryption

```typescript
import { sexsec } from 'sexsec';

// Setup
sexsec.changeKey('my-secret-key');
sexsec.changeEncoding('base64');

// Encrypt and decrypt text
const plaintext = 'This is a secret message!';
const encrypted = sexsec.encryptChar(plaintext);
const decrypted = sexsec.decryptChar(encrypted);

console.log('Original:', plaintext);
console.log('Encrypted:', encrypted);
console.log('Decrypted:', decrypted);
```

### File Encryption

```typescript
import { sexsec } from 'sexsec';

async function encryptMyFile() {
  try {
    // Set encryption key
    sexsec.changeKey('super-secret-password');
    
    // Encrypt file (keeps original)
    const encryptedPath = await sexsec.encryptFile('./document.pdf');
    console.log(`File encrypted: ${encryptedPath}`);
    
    // Encrypt file (deletes original)
    await sexsec.encryptFile('./another-file.txt', true);
    
    // Decrypt file
    const decryptedPath = sexsec.decryptFile('./document.pdf.sex');
    console.log(`File decrypted: ${decryptedPath}`);
  } catch (error) {
    console.error('Encryption failed:', error.message);
  }
}

encryptMyFile();
```

### Directory Encryption

```typescript
import { sexsec } from 'sexsec';

async function encryptDirectory() {
  try {
    // Set encryption key
    sexsec.changeKey('directory-encryption-key');
    
    // Encrypt entire directory (preserve originals)
    await sexsec.encryptDir('./my-documents');
    console.log('Directory encrypted successfully!');
    
    // Decrypt entire directory (remove encrypted files)
    await sexsec.decryptDir('./my-documents', true);
    console.log('Directory decrypted successfully!');
  } catch (error) {
    console.error('Directory operation failed:', error.message);
  }
}

encryptDirectory();
```

### Advanced Configuration

```typescript
import { sexsec } from 'sexsec';

// Custom configuration
sexsec.changeKey('my-advanced-key');
sexsec.changeEncoding('base64url');
sexsec.changeIvLength(16);

// Batch file processing
async function processFiles(filePaths: string[]) {
  for (const filePath of filePaths) {
    try {
      await sexsec.encryptFile(filePath, false);
      console.log(`✅ Encrypted: ${filePath}`);
    } catch (error) {
      console.error(`❌ Failed to encrypt ${filePath}:`, error.message);
    }
  }
}

processFiles([
  './file1.txt',
  './file2.pdf',
  './file3.docx'
]);
```

## 🔒 Security Notes

- **Key Management**: Store your encryption keys securely. Lost keys mean lost data!
- **Backup**: Always backup your original files before using `force: true`
- **Algorithm**: Uses AES-256-CBC encryption with SHA-256 key derivation
- **IV**: Each file gets a unique random initialization vector for enhanced security

## ⚠️ Important Warnings

1. **Data Loss Prevention**: When using `force: true`, original files are permanently deleted after successful encryption
2. **Key Security**: Keep your encryption keys safe - there's no way to recover encrypted data without the correct key
3. **File Extensions**: Encrypted files use `.sex` extension - ensure your system can handle these files
4. **Async Operations**: File and directory operations are asynchronous - always use `await`

## 🛠️ Requirements

- Node.js >= 16.0.0
- TypeScript (for development)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Issues

If you encounter any issues or have feature requests, please file them in the [GitHub Issues](https://github.com/Kisakay/SexSec/issues) section.

## 📊 Changelog

### v1.0.0
- Initial release
- Basic encryption/decryption functionality
- File and directory operations
- TypeScript support
- Comprehensive documentation

---

Made with ❤️ for secure file encryption
