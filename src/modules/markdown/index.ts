import { defineModule } from "@/shared/module";

import {
    parseMarkdownImageUploadConfigFilePath,
    parseMarkdownImageUploadEnable,
} from "./parseConfigs";
import { registerDiagnosticNoInvalidLocalImageFilePath } from "./registerDiagnostics/noInvalidLocalImageFilePath";
import { registerDiagnosticNoLocalImageLink } from "./registerDiagnostics/noLocalImageLink";

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
