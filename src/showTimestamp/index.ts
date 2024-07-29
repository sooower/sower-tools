import dayjs from "dayjs";

import { vscode } from "@/shared";

export async function showNowTimestamp() {
    const timestampStatusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        -100
    );
    const timestampStatusBarItemTimer = setInterval(() => {
        timestampStatusBarItem.text = dayjs().format("HH:mm:ss");
    }, 1000);
    timestampStatusBarItem.show();

    return timestampStatusBarItemTimer;
}
