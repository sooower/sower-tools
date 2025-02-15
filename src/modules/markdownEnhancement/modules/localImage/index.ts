import { defineModule } from "@/shared/moduleManager";

import { parseUploadImageConfigFilePath } from "./configs/uploadImageConfigFilePath";
import { parseUploadImageEnable } from "./configs/uploadImageEnable";
import { registerDiagnosticNoInvalidLocalImageFilePath } from "./diagnostics/noInvalidLocalImageFilePath";
import { registerDiagnosticNoLocalImageLink } from "./diagnostics/noLocalImageLink";

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
