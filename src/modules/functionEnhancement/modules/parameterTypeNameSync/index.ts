import { defineModule } from "@/shared/moduleManager";

import { registerOnDidSaveTextDocumentListener } from "./listeners";

export const parameterTypeNameSync = defineModule({
    onActive() {
        registerOnDidSaveTextDocumentListener();
    },
});
