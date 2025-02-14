import { vscode } from "@/shared";
import { extensionName } from "@/shared/context";

export let statusBarItem: vscode.StatusBarItem;

export async function showStatusBarCountdownTimer() {
    statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        -80
    );
    statusBarItem.text = "▶";
    statusBarItem.tooltip = "Click to start countdown timer";
    statusBarItem.command = `${extensionName}.countdownTimer`;

    statusBarItem.show();
}
