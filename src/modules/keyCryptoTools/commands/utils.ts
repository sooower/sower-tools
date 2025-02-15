import crypto from "node:crypto";

import { CommonUtils } from "@utils/common";

const kAuthTagLength = 16;

export type TDecryptOptions = {
    text: string;
};

export type TKeyDecryptReturn = {
    plaintext: Buffer;
};

export class KeyCrypto {
    private dataAesKey256: Buffer | undefined;

    constructor({ key }: { key?: string }) {
        if (key === undefined) {
            this.dataAesKey256 = undefined;

            return;
        }

        this.dataAesKey256 = CommonUtils.createAESKeySync(key, 256);
    }

    enabled() {
        return this.dataAesKey256 !== undefined;
    }

    encrypt(iv: Buffer, text: string): string {
        if (!this.enabled()) {
            throw new Error(`KeyDecrypt is not enabled.`);
        }

        CommonUtils.assert(iv.length === 16, `FormatError: Invalid IV length.`);

        const cipher = crypto.createCipheriv(
            "aes-256-gcm",
            CommonUtils.assertBuffer(this.dataAesKey256),
            iv,
            {
                authTagLength: 16,
            }
        );

        const cipherText = cipher.update(text, "utf8");
        cipher.final();
        const tag = cipher.getAuthTag();
        return [
            "fomo1",
            "aes-256-gcm",
            iv.toString("base64"),
            Buffer.concat([cipherText, tag]).toString("base64"),
        ].join("$");
    }

    decrypt(options: TDecryptOptions): TKeyDecryptReturn {
        const aesKey256 = this.dataAesKey256;

        const { text } = options;

        if (aesKey256 === undefined) {
            throw new Error(`KeyDecrypt is not enabled.`);
        }

        const encapsulation = text.trim().split("$");

        const packaging = encapsulation[0];

        switch (packaging) {
            case "fomo1":
                break;
            default:
                throw new RangeError(
                    `Unsupported encapsulation "${packaging}"`
                );
        }

        CommonUtils.assert(
            encapsulation.length === 4,
            `FormatError: Encapsulated ciphertext has an invalid format.`
        );

        const [, cipher, encodedIv, encodedCiphertextWithAuthTag] =
            encapsulation;

        switch (cipher) {
            case "aes-256-gcm":
                break;
            default:
                throw new RangeError(`Unsupported cipher "${cipher}".`);
        }

        const iv = Buffer.from(encodedIv, "base64");
        CommonUtils.assert(
            iv.toString("base64") === encodedIv,
            `FormatError: Invalid IV.`
        );
        CommonUtils.assert(iv.length === 16, `FormatError: Invalid IV length.`);

        const ciphertextWithAuthTag = Buffer.from(
            encodedCiphertextWithAuthTag,
            "base64"
        );
        CommonUtils.assert(
            ciphertextWithAuthTag.toString("base64") ===
                encodedCiphertextWithAuthTag,
            `FormatError: Invalid payload.`
        );
        if (!(ciphertextWithAuthTag.length > kAuthTagLength)) {
            throw new RangeError("Invalid payload length.");
        }

        const authTag = ciphertextWithAuthTag.subarray(
            ciphertextWithAuthTag.length - kAuthTagLength
        );
        const ciphertext = ciphertextWithAuthTag.subarray(
            0,
            ciphertextWithAuthTag.length - kAuthTagLength
        );

        const decipher = crypto.createDecipheriv("aes-256-gcm", aesKey256, iv, {
            authTagLength: kAuthTagLength,
        });
        decipher.setAuthTag(authTag);

        const plaintext = Buffer.concat([
            decipher.update(ciphertext),
            decipher.final(),
        ]);

        return {
            plaintext,
        };
    }
}
