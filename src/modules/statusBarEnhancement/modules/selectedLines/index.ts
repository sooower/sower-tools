import { defineModule } from "@/core/moduleManager";

import { registerOnDidChangeTextEditorSelectionListener } from "./listeners";

export const selectedLines = defineModule({
    onActive() {
        registerOnDidChangeTextEditorSelectionListener();
    },
});
