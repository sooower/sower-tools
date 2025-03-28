import path from "node:path";

import { extensionCtx, extensionName, fs, vscode } from "@/core";
import { getWorkspaceFolderPath, setContext } from "@/utils/vscode";

export let ifShowDebugProject: boolean;

export function registerListeners() {
    recheckContextIfShowDebugProject();
    extensionCtx.subscriptions.push(
        vscode.workspace.onDidChangeWorkspaceFolders(e => {
            recheckContextIfShowDebugProject();
        })
    );
}

function recheckContextIfShowDebugProject() {
    const configItem = `${extensionName}.runEnhancement.ifShowDebugProject`;

    const workspaceFolderPath = getWorkspaceFolderPath();
    if (workspaceFolderPath === undefined) {
        setContext(configItem, false);

        return;
    }

    const tsconfigFilePath = path.join(workspaceFolderPath, "tsconfig.json");
    if (fs.existsSync(tsconfigFilePath)) {
        setContext(configItem, true);
    } else {
        setContext(configItem, false);
    }
}
