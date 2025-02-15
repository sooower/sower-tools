import { defineModule } from "@/shared/moduleManager";

import { registerOnDidSaveTextDocumentListener } from "./listeners";

export const syncFunctionParameterTypeName = defineModule({
    onActive() {
        registerOnDidSaveTextDocumentListener();
    },
});
