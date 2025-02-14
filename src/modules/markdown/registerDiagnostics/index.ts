import { registerDiagnosticNoInvalidLocalImageFilePath } from "./noInvalidLocalImageFilePath";
import { registerDiagnosticNoLocalImageLink } from "./noLocalImageLink";

export function registerDiagnostics() {
    registerDiagnosticNoInvalidLocalImageFilePath();
    registerDiagnosticNoLocalImageLink();
}
