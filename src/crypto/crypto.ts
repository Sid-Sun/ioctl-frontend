import passphrase from '../passphrase'
import { hash as argon2 } from 'argon2-webworker'
import pako from 'pako'
import { Base64 } from 'js-base64'
import { environment } from '../environment'
import { SnippetModel, SnippetSpecModel, SnippetSpecVersion } from '../model'


export interface CryptoStack {
    snippetID: string
    uuid: string
    encryptionKey: Uint8Array
    keySalt: Uint8Array
    initVector: Uint8Array
}

enum ARGON2Config {
    Key = 0,
    ID = 1,
}

enum ArgonType {
    Argon2d = 0,
    Argon2i = 1,
    Argon2id = 2,
}

interface Argon2BrowserHashResult {
    encoded: string;
    hash: Uint8Array;
    hashHex: string;
}

export function getSnippetUUID(id: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
        resolve((await hasher(id, new TextEncoder().encode(environment.salt), ARGON2Config.ID)).hashHex)
    })
}

export function generateEncryptionStack(ephemeral: boolean): Promise<CryptoStack> {
    return new Promise(async (resolve, reject) => {
        const snippetID = ephemeral ? passphrase() : passphrase(3) // non-ephemeral are longer
        const uuidCall = hasher(snippetID, new TextEncoder().encode(environment.salt), ARGON2Config.ID)

        // generate nonce for encryption key derivation and AES-256-GCM
        const iv = generateIV()
        const keySalt = generateIV()
        const key = (await hasher(snippetID, keySalt, ARGON2Config.Key)).hash
        const uuid = (await uuidCall).hashHex
        resolve({
            snippetID,
            uuid,
            encryptionKey: key,
            keySalt: keySalt,
            initVector: iv
        })
    })
}

function hasher(passStr: string, salt: Uint8Array, config: ARGON2Config): Promise<Argon2BrowserHashResult> {
    const pass = new TextEncoder().encode(passStr)
    return config === ARGON2Config.ID ?
        // ID Configuration
        // parallelism  memory  rounds  time
        // 12           32      32      0.210900
        argon2({
            salt,
            pass,
            type: ArgonType.Argon2id,
            parallelism: 12,
            mem: 32768, // 32*1024
            hashLen: 32,
            time: 32
        }) :
        // Key Configuration
        // parallelism  memory  rounds  time
        // 16           64      12      0.249461
        argon2({
            salt,
            pass,
            type: ArgonType.Argon2id,
            parallelism: 16,
            mem: 65536, // 64*1024
            hashLen: 32,
            time: 12
        })

}

function generateIV() {
    // TODO: Replace with random bytes
    // Return 32 Bytes
    return new TextEncoder().encode(crypto.randomUUID()).slice(0, 32)
}

export function aeadEncrypt(snippet: SnippetModel, stack: CryptoStack): Promise<SnippetSpecModel> {
    return new Promise(async (resolve, reject) => {
        snippet.data = Base64.fromUint8Array(pako.deflate(snippet.data, {
            level: 7,
        }), true)
        const snippetData = new TextEncoder().encode(JSON.stringify(snippet))
        // call encrypt with json encoded snippet, generated encrypted key and a nonce for GCM
        const ciphertext = await encrypt(stack.encryptionKey, snippetData, stack.initVector)
        // format and package ciphertext
        const ciphertextBytes = new Uint8Array(ciphertext)
        resolve({
            version: SnippetSpecVersion.v2,
            keysalt: Base64.fromUint8Array(stack.keySalt, true),
            initvector: Base64.fromUint8Array(stack.initVector, true),
            ciphertext: Base64.fromUint8Array(ciphertextBytes, true),
            ephemeral: snippet.metadata.ephemeral
        })
    })
}

export function aeadDecrypt(data: SnippetSpecModel, id: string, version: SnippetSpecVersion): Promise<SnippetModel> {
    return new Promise(async (resolve, reject) => {
        // B64 decode
        const keySalt: Uint8Array = Base64.toUint8Array(data.keysalt);
        const iv: Uint8Array = Base64.toUint8Array(data.initvector);
        const ciphertext: Uint8Array = Base64.toUint8Array(data.ciphertext);

        // regenerate encryption key using ARGON2 with extracted salt and decrypt
        const key = await hasher(id, keySalt, ARGON2Config.Key);
        const plaintext = await decrypt(key.hash, ciphertext, iv);
        if (version === SnippetSpecVersion.v1) {
            // decompress snippet
            const decompressedSnippet = pako.inflate(plaintext);
            const snippet: SnippetModel = JSON.parse(new TextDecoder().decode(decompressedSnippet));
            resolve(snippet)
            return
        }
        // V2
        const snippet: SnippetModel = JSON.parse(new TextDecoder().decode(plaintext));
        snippet.data = pako.inflate(Base64.toUint8Array(snippet.data), {
            to: "string"
        })
        resolve(snippet)
    })
}

async function encrypt(key: Uint8Array, plaintext: Uint8Array, iv: Uint8Array): Promise<ArrayBuffer> {
    const key_2 = await importKey(key);
    return await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv
        }, key_2, plaintext
    );
}

async function decrypt(key: Uint8Array, ciphertext: Uint8Array, iv: Uint8Array): Promise<ArrayBuffer> {
    const key_2 = await importKey(key);
    return await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv
        }, key_2, ciphertext
    );
}

function importKey(key: Uint8Array) {
    return crypto.subtle.importKey(
        "raw",
        key,
        { "name": "AES-GCM" },
        false,
        ["encrypt", "decrypt"]
    )
}
