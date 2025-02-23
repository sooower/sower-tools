import { defineModule } from "@/core";

import { registerOnDidSaveTextDocumentListener } from "./listeners";

export const parameterTypeNameSync = defineModule({
    onActive() {
        registerOnDidSaveTextDocumentListener();
    },
});
