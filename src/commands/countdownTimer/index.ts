import { format } from "node:util";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration"; // ES 2015
dayjs.extend(duration);

import { ThemeColor } from "vscode";

import { statusBarItem } from "@/executeOnExtensionActive/showCountdownTimer";
import { vscode } from "@/shared";
import {
    countdownTimerOptions,
    extensionCtx,
    kRestore,
    TCountdownTimerOption,
} from "@/shared/init";
import { extensionName } from "@/shared/init";
import { nowDatetime } from "@utils/datetime";

let countdownTimer: NodeJS.Timeout | undefined;
let originalSelecteeDuration = 0;
let remainingOption: TCountdownTimerOption = { label: "", duration: 0 };
let isStarted = false;

export async function subscribeCountdownTimer() {
    const command = vscode.commands.registerCommand(
        `${extensionName}.countdownTimer`,
        async () => {
            try {
                startCountdown();
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(`${e}`);
            }
        }
    );

    extensionCtx.subscriptions.push(command);
}

async function startCountdown() {
    if (isStarted) {
        statusBarItem.tooltip = "Click to restore/reset countdown timer";
        isStarted = false;

        return;
    }

    const selected = await vscode.window.showQuickPick(
        countdownTimerOptions.map(it => it.label),
        {
            placeHolder: "Select countdown time or restore last one",
        }
    );
    const selectedOption = countdownTimerOptions.find(
        it => it.label === selected
    );
    if (selectedOption === undefined) {
        return;
    }

    if (selectedOption.label !== kRestore) {
        Object.assign(remainingOption, selectedOption);
        originalSelecteeDuration = selectedOption.duration;
    }

    startTimer();
}

function startTimer() {
    if (countdownTimer !== undefined) {
        clearTimeout(countdownTimer);
    }

    if (remainingOption.duration <= 0) {
        return;
    }

    isStarted = true;
    statusBarItem.tooltip = "Click to pause countdown timer";

    countdownTimer = setInterval(() => {
        if (!isStarted) {
            return;
        }

        statusBarItem.backgroundColor = new ThemeColor(
            remainingOption.duration / originalSelecteeDuration <= 0.2
                ? "statusBarItem.errorBackground"
                : "statusBarItem.warningBackground"
        );

        if (remainingOption.duration <= 0) {
            vscode.window.showInformationMessage(
                `[${nowDatetime()}] The ${remainingOption.label} already up!`
            );
            statusBarItem.backgroundColor = undefined;
            isStarted = false;
            clearInterval(countdownTimer!);
            countdownTimer = undefined;
        }

        const duration = dayjs.duration(remainingOption.duration);
        statusBarItem.text = format(
            `%s:%s:%s`,
            paddingTimeStamp(duration.hours()),
            paddingTimeStamp(duration.minutes()),
            paddingTimeStamp(duration.seconds())
        );

        remainingOption.duration -= 1000;
    }, 1000);
}

function paddingTimeStamp(num: number) {
    return num < 10 ? `0${num}` : `${num}`;
}
