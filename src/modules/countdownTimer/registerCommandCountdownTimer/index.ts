import { format } from "node:util";

import dayjs from "dayjs";
import duration, { Duration } from "dayjs/plugin/duration"; // ES 2015
dayjs.extend(duration);

import { ThemeColor } from "vscode";

import { vscode } from "@/shared";
import {
    countdownTimerOptions,
    extensionCtx,
    kRestore,
    TCountdownTimerOption,
} from "@/shared/init";
import { extensionName } from "@/shared/init";
import { nowDatetime } from "@utils/datetime";

import { statusBarItem } from "../showCountdownTimer";

let countdownTimer: NodeJS.Timeout | undefined;

/**
 * Selected countdown time duration.
 */
let originalDuration = 0;

/**
 * Remaining countdown time option, decreased by 1000ms per tick.
 */
let remainingOption: TCountdownTimerOption = { label: "", duration: 0 };

/**
 * A flag to indicate if countdown is started.
 *
 * If false, it means countdown is not start before, or it is paused, in this case countdown interval will be skipped per tick if it is started.
 */
let isCountdownStarted = false;

export async function registerCountdownTimer() {
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
    if (isCountdownStarted) {
        // Pause countdown timer

        isCountdownStarted = false; // Update the flag to skip countdown interval
        statusBarItem.tooltip = "Click to restore/reselect countdown timer";

        if (remainingOption.duration > 0) {
            statusBarItem.text = format(
                `▶ %s`,
                convertToTimestamp(dayjs.duration(remainingOption.duration))
            );
        } else {
            finishCountdown();
        }

        return;
    }

    // Start/resume countdown timer

    statusBarItem.tooltip = "Click to pause countdown timer";

    const selected = await vscode.window.showQuickPick(
        countdownTimerOptions.map(it => it.label),
        {
            placeHolder: "Select a new countdown time or restore last one",
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
        originalDuration = selectedOption.duration;
    }

    if (countdownTimer !== undefined) {
        clearTimeout(countdownTimer);
    }

    isCountdownStarted = true;
    doCountdown();
    countdownTimer = setInterval(() => {
        doCountdown();
    }, 1000);
}

function doCountdown() {
    if (!isCountdownStarted) {
        return;
    }

    // Set background color
    statusBarItem.backgroundColor = new ThemeColor(
        remainingOption.duration / originalDuration <= 0.2
            ? "statusBarItem.errorBackground"
            : "statusBarItem.warningBackground"
    );

    // Check if countdown is finished
    if (remainingOption.duration <= 0) {
        finishCountdown();

        return;
    }

    // Update status bar
    statusBarItem.text = format(
        `■ %s`,
        convertToTimestamp(dayjs.duration(remainingOption.duration))
    );

    remainingOption.duration -= 1000;
}

function finishCountdown() {
    vscode.window.showInformationMessage(
        `[${nowDatetime()}] The ${remainingOption.label} already up!`
    );
    statusBarItem.backgroundColor = undefined;
    statusBarItem.text = "▶";
    isCountdownStarted = false;
    clearInterval(countdownTimer!);
    countdownTimer = undefined;
}

function convertToTimestamp(duration: Duration) {
    const leftPaddingNumber = (num: number) => `0${num}`.slice(-2);

    return format(
        `%s:%s:%s`,
        leftPaddingNumber(duration.hours()),
        leftPaddingNumber(duration.minutes()),
        leftPaddingNumber(duration.seconds())
    );
}
