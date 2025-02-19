import { defineModule } from "@/core/moduleManager";

import {
    registerCommandListFiles,
    registerCommandNoSkipWorkTree,
    registerCommandSkipWorkTree,
} from "./commands";

export const gitEnhancement = defineModule({
    onActive() {
        registerCommandListFiles();
        registerCommandNoSkipWorkTree();
        registerCommandSkipWorkTree();
    },
});
