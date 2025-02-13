import { registerNoInvalidLocalImageFilePath } from "./noInvalidLocalImageFilePath";
import { registerNoLocalImageLink } from "./noLocalImageLink";

export function registerDiagnostics() {
    registerNoInvalidLocalImageFilePath();
    registerNoLocalImageLink();
}
