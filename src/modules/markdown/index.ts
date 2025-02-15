import { defineModule } from "@/shared/moduleManager";

import { parseMarkdownImageUploadConfigFilePath } from "./configs/markdownImageUploadConfigFilePath";
import { parseMarkdownImageUploadEnable } from "./configs/markdownImageUploadEnable";
import { registerDiagnosticNoInvalidLocalImageFilePath } from "./diagnostics/noInvalidLocalImageFilePath";
import { registerDiagnosticNoLocalImageLink } from "./diagnostics/noLocalImageLink";

export const markdown = defineModule({
    onActive() {
        registerDiagnosticNoInvalidLocalImageFilePath();
        registerDiagnosticNoLocalImageLink();
    },
    onReloadConfiguration() {
        parseMarkdownImageUploadEnable();
        parseMarkdownImageUploadConfigFilePath();
    },
});
