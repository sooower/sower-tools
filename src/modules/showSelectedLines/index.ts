import { defineModule } from "@/shared/module";

import { registerOnDidChangeTextEditorSelectionListener } from "./listeners";

export const showSelectedLines = defineModule({
    onActive() {
        registerOnDidChangeTextEditorSelectionListener();
    },
});
