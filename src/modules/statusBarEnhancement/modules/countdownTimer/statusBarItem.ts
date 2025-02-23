import { extensionName, vscode } from "@/core";

export let statusBarItem: vscode.StatusBarItem;

export async function showStatusBarCountdownTimer() {
    statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        -80
    );
    statusBarItem.text = "▶";
    statusBarItem.tooltip = "Click to start countdown timer";
    statusBarItem.command = `${extensionName}.statusBarEnhancement.countdownTimer`;

    statusBarItem.show();
}
