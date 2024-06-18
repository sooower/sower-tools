import { subscribeBase64Decode } from "./base64Decode";
import { subscribeBase64Encode } from "./base64Encode";

export function subscribeStringTools() {
    subscribeBase64Encode();
    subscribeBase64Decode();
}
