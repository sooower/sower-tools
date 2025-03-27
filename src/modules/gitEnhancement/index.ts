import { defineModule } from "@/core";

import { registerCommandForcePush } from "./commands/forcePush";
import { registerCommandListSkippedFiles } from "./commands/listSkippedFiles";
import { registerCommandNoSkipWorkTree } from "./commands/noSkipWorkTree";
import { registerCommandSkipWorkTree } from "./commands/skipWorkTree";

export const gitEnhancement = defineModule({
    onActive() {
        registerCommandListSkippedFiles();
        registerCommandNoSkipWorkTree();
        registerCommandSkipWorkTree();
        registerCommandForcePush();
    },
});
