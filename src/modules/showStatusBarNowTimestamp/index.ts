import { vscode } from "@/shared";
import { defineModule } from "@/shared/module";
import { datetime } from "@utils/datetime";

import {
    enableShowStatusBarNowTimestamp,
    parseShowStatusBarNowTimestampConfigs,
} from "./parseConfig";

let statusBarNowTimestampTimer: NodeJS.Timeout;
let statusBarNowTimestampItem: vscode.StatusBarItem | undefined;

export function showNowTimestampStatusBarItem() {
    statusBarNowTimestampItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        -100
    );
    statusBarNowTimestampTimer = setInterval(() => {
        statusBarNowTimestampItem &&
            (statusBarNowTimestampItem.text = datetime().format("HH:mm:ss"));
    }, 1000);
}

export function clearNowTimestampStatusBarItemTimer() {
    clearInterval(statusBarNowTimestampTimer);
    console.log(`Timer "statusBarNowTimestampTimer" has clear.`);
}

export const showStatusBarNowTimestamp = defineModule({
    onActive() {
        showNowTimestampStatusBarItem();
        enableShowStatusBarNowTimestamp
            ? statusBarNowTimestampItem?.show()
            : statusBarNowTimestampItem?.hide();
    },
    onDeactive() {
        clearNowTimestampStatusBarItemTimer();
    },
    onReloadConfiguration() {
        parseShowStatusBarNowTimestampConfigs();

        enableShowStatusBarNowTimestamp
            ? statusBarNowTimestampItem?.show()
            : statusBarNowTimestampItem?.hide();
    },
});
