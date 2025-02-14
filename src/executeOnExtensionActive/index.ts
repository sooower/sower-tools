import { enableShowDefaultOpenedDocument } from "@/shared/init";

import { showDefaultOpenedDocument } from "./showDefaultOpenedDocument";

export async function executeOnExtensionActive() {
    if (enableShowDefaultOpenedDocument) {
        await showDefaultOpenedDocument();
    }
}
