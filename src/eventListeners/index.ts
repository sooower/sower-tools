import { subscribeOnDidChangeTextEditorSelectionListener } from "./onDidChangeTextEditorSelection";
import { subscribeOnDidSaveTextDocumentListener } from "./onDidSaveTextDocument";

export function subscribeEventListeners() {
    subscribeOnDidSaveTextDocumentListener();
    subscribeOnDidChangeTextEditorSelectionListener();
}
