import { vscode } from "@/shared";
import { datetime } from "@utils/datetime";

import { enableShowStatusBarNowTimestamp } from "./configs";

export let statusBarItem: vscode.StatusBarItem | undefined;

let timer: NodeJS.Timeout | undefined;

export function refreshNowTimestampStatusBarItem() {
    if (statusBarItem === undefined || timer === undefined) {
        createNowTimestampStatusBarItem();
    }

    enableShowStatusBarNowTimestamp
        ? statusBarItem?.show()
        : statusBarItem?.hide();
}

function createNowTimestampStatusBarItem() {
    statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        -100
    );
    timer = setInterval(() => {
        statusBarItem !== undefined &&
            (statusBarItem.text = datetime().format("HH:mm:ss"));
    }, 1000);
}

export function clearNowTimestampStatusBarItemTimer() {
    if (timer === undefined) {
        return;
    }

    clearInterval(timer);
    console.log(`Timer "statusBarNowTimestampTimer" has clear.`);
}
