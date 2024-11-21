import { subscribeKeyDecrypt } from "./keyDecrypt";
import { subscribeKeyEncrypt } from "./keyEncrypt";

export function subscribeKeyCryptoTools() {
    subscribeKeyEncrypt();
    subscribeKeyDecrypt();
}
