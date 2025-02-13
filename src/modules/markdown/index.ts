import { defineModule } from "@/shared/utils/module";

import { registerDiagnostics } from "./registerDiagnostics";

export default defineModule({
    onActive() {
        registerDiagnostics();
    },
    onDeactive() {},
});
