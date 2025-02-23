import { defineModule } from "@/core";

import {
    parseUploadImageConfigFilePath,
    parseUploadImageEnable,
} from "./configs";
import {
    registerDiagnosticNoInvalidLocalImageFilePath,
    registerDiagnosticNoLocalImageLink,
} from "./diagnostics";

export const localImage = defineModule({
    onActive() {
        registerDiagnosticNoInvalidLocalImageFilePath();
        registerDiagnosticNoLocalImageLink();
    },
    onReloadConfiguration() {
        parseUploadImageEnable();
        parseUploadImageConfigFilePath();
    },
});
