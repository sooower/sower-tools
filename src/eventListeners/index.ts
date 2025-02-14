import { subscribeOnDidSaveTextDocumentListener } from "./onDidSaveTextDocument";

export function subscribeEventListeners() {
    subscribeOnDidSaveTextDocumentListener();
}
