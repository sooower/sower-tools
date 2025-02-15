import { vscode } from "@/shared";
import { extensionCtx, extensionName } from "@/shared/context";

const kTerminalName = "Temp";

export function registerCommandListFiles() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.gitEnhancement.listFiles`,
            () => {
                const terminal = createTempTerminal();
                terminal.sendText(`git ls-files -v`);
            }
        )
    );
}

function createTempTerminal() {
    const terminal =
        vscode.window.terminals.find(it => it.name === kTerminalName) ??
        vscode.window.createTerminal(kTerminalName);
    terminal.show();

    return terminal;
}
