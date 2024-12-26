import { vscode } from "@/shared";
import { extensionName } from "@/shared/init";

export let statusBarItem: vscode.StatusBarItem;

export async function showCountdownTimer() {
    statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        -80
    );
    statusBarItem.text = "00:00:00";
    statusBarItem.tooltip = "Click to start countdown timer";
    statusBarItem.command = `${extensionName}.countdownTimer`;

    statusBarItem.show();
}
