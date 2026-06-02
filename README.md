# encdec-service

A NestJS service that encrypts and decrypts payloads using **AES-256-CBC** (for the data) and **RSA PKCS#1** (for the AES key).

## How it works

| Endpoint | What it does |
|---|---|
| `POST /get-encrypt-data` | Generates a random AES key, encrypts the payload with it, then encrypts the AES key with the RSA private key. Returns `data1` (encrypted key) and `data2` (encrypted payload). |
| `POST /get-decrypt-data` | Decrypts `data1` with the RSA public key to recover the AES key, then decrypts `data2` with that key to recover the original payload. |

---

## Prerequisites

- Node.js 18+
- npm 9+
- OpenSSL (only if generating keys via command line — see option A below)
  - macOS: pre-installed
  - Ubuntu/Debian: `sudo apt install openssl`
  - Windows: download from https://slproweb.com/products/Win32OpenSSL.html or use Git Bash (which bundles it)

---

## 1. Generate RSA keys

Choose **one** of the two options below.

### Option A — Command line (openssl)

```bash
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
```

This writes `private.pem` and `public.pem` to the current directory. You will paste their contents into `.env` in the next step.

### Option B — Browser (no install required)

1. Go to **https://cryptotools.net/rsagen**
2. Select key size **2048**
3. Click **Generate**
4. Copy the private key and public key — you will paste them into `.env` in the next step

---

## 2. Configure environment

Copy the example file:

```bash
cp .env.example .env
```

Open `.env` and paste your keys. Each key must be a single line with literal `\n` in place of newlines:

```env
PORT=3000
PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----"
PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIB...\n-----END PUBLIC KEY-----"
```

If you generated keys with openssl, this one-liner formats and appends them for you:

```bash
echo "PRIVATE_KEY=\"$(awk 'NF {printf "%s\\n", $0}' private.pem)\"" >> .env
echo "PUBLIC_KEY=\"$(awk 'NF {printf "%s\\n", $0}' public.pem)\"" >> .env
```

> The service will **refuse to start** if `PRIVATE_KEY` or `PUBLIC_KEY` are missing.

---

## 3. Install dependencies

```bash
npm install
```

---

## 4. Run the service

```bash
# Development (hot-reload)
npm run start:dev

# Production
npm run build
npm run start:prod
```

The service starts on `http://localhost:3000` (or the port set in `.env`).

---

## 5. API documentation

Swagger UI is available at:

```
http://localhost:3000/api-docs
```

---

## 6. Run tests

```bash
# Run all unit tests
npm test

# With coverage report
npm run test:cov

# Watch mode
npm run test:watch
```

---

## API reference

### `POST /get-encrypt-data`

**Request**
```json
{ "payload": "Hello, World!" }
```
`payload` is required, max 2000 characters.

**Response**
```json
{
  "successful": true,
  "error_code": "",
  "data": {
    "data1": "<base64 RSA-encrypted AES key>",
    "data2": "<base64 AES-encrypted payload>"
  }
}
```

---

### `POST /get-decrypt-data`

**Request**
```json
{
  "data1": "<base64 RSA-encrypted AES key>",
  "data2": "<base64 AES-encrypted payload>"
}
```

**Response**
```json
{
  "successful": true,
  "error_code": "",
  "data": {
    "payload": "Hello, World!"
  }
}
```

**Error response** (invalid input or key mismatch)
```json
{
  "successful": false,
  "error_code": "DECRYPT_FAILED",
  "data": null
}
```
