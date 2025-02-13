import { defineModule } from "@/shared/utils/module";

import { registerDiagnostics } from "./registerDiagnostics";

export const markdown = defineModule({
    onActive() {
        registerDiagnostics();
    },
    onDeactive() {},
});
