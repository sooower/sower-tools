import { defineModule } from "@/shared/moduleManager";

import { registerOnDidChangeTextEditorSelectionListener } from "./listeners";

export const selectedLines = defineModule({
    onActive() {
        registerOnDidChangeTextEditorSelectionListener();
    },
});
