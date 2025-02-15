import { defineModule } from "@/shared/moduleManager";

import { registerOnDidChangeTextEditorSelectionListener } from "./listeners";

export const showSelectedLines = defineModule({
    onActive() {
        registerOnDidChangeTextEditorSelectionListener();
    },
});
