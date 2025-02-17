import { defineModule } from "@/core/moduleManager";

import { registerOnDidSaveTextDocumentListener } from "./listeners";

export const parameterTypeNameSync = defineModule({
    onActive() {
        registerOnDidSaveTextDocumentListener();
    },
});
