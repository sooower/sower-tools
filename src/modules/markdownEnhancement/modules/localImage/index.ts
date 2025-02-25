import { defineModule } from "@/core";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerCommandUploadImageToMinioStorage } from "./commands";
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

        registerCommandUploadImageToMinioStorage();
        registerCodeActionsProviders();
    },
    onReloadConfiguration() {
        parseUploadImageEnable();
        parseUploadImageConfigFilePath();
    },
});
