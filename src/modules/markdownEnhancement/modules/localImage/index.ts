import { defineModule } from "@/core";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerCommandUploadImageToMinioStorage } from "./commands";
import { parseUploadImageConfigFilePath } from "./configs/uploadImageConfigFilePath";
import { parseUploadImageEnable } from "./configs/uploadImageEnable";
import { registerDiagnosticNoInvalidLocalImageFilePath } from "./diagnostics/noInvalidLocalImageFilePath";
import { registerDiagnosticNoLocalImageLink } from "./diagnostics/noLocalImageLink";

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
