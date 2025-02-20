import { defineModule } from "@/core/moduleManager";

import {
    registerCommandForcePush,
    registerCommandListSkippedFiles,
    registerCommandNoSkipWorkTree,
    registerCommandSkipWorkTree,
} from "./commands";

export const gitEnhancement = defineModule({
    onActive() {
        registerCommandListSkippedFiles();
        registerCommandNoSkipWorkTree();
        registerCommandSkipWorkTree();
        registerCommandForcePush();
    },
});
