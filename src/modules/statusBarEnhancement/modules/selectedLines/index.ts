import { defineModule } from "@/core";

import { registerOnDidChangeTextEditorSelectionListener } from "./listeners";

export const selectedLines = defineModule({
    onActive() {
        registerOnDidChangeTextEditorSelectionListener();
    },
});
