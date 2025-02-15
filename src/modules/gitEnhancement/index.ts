import { defineModule } from "@/shared/moduleManager";

import { registerCommandListFiles } from "./commands/listFiles";
import { registerCommandNoSkipWorkTree } from "./commands/noSkipWorkTree";
import { registerCommandSkipWorkTree } from "./commands/skipWorkTree";

export const gitEnhancement = defineModule({
    onActive() {
        registerCommandListFiles();
        registerCommandNoSkipWorkTree();
        registerCommandSkipWorkTree();
    },
});
