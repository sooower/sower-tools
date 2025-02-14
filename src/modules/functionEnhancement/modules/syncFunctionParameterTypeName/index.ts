import { defineModule } from "@/shared/module";

import { registerOnDidSaveTextDocumentListener } from "./listeners";

export const syncFunctionParameterTypeName = defineModule({
    onActive() {
        registerOnDidSaveTextDocumentListener();
    },
});
