import { defineModule } from "@/shared/module";

import { parseMarkdownImageUploadConfigFilePath } from "./configs/markdownImageUploadConfigFilePath";
import { registerDiagnosticNoInvalidLocalImageFilePath } from "./diagnostics/noInvalidLocalImageFilePath";

export const markdown = defineModule({
    onActive() {
        registerDiagnosticNoInvalidLocalImageFilePath();
        registerDiagnosticNoInvalidLocalImageFilePath();
    },
    onReloadConfiguration() {
        parseMarkdownImageUploadConfigFilePath();
        parseMarkdownImageUploadConfigFilePath();
    },
});
