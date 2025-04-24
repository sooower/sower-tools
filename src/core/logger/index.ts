import { extensionCtx, extensionDisplayName, format, vscode } from "@/core";
import { nowDatetime } from "@utils/datetime";

import { convertColor, EColor } from "./color";

export let logger: Logger;

/**
 * Initialize logger for printing information in output channel and console,
 * also show message in vscode notification (if needed).
 */
export function initializeLogger() {
    logger = new Logger();
}

enum ELevel {
    Trace = "trace",
    Debug = "debug",
    Info = "info",
    Warn = "warn",
    Error = "error",
}

const kSeeDetails = "See Details...";

class Logger {
    channel: vscode.LogOutputChannel;

    constructor() {
        this.channel = vscode.window.createOutputChannel(extensionDisplayName, {
            log: true,
        });
        extensionCtx.subscriptions.push(this.channel);
    }

    /**
     * Show trace level logs in the output channel, console (in dev mode).
     *
     * **NOTICE:** The message is only logged if configured displaying `TRACE` log level
     * (open command palette and select "Developer: Set Log Level..." to configure).
     *
     * @param message - The message to log
     * @param args - The arguments to log
     */
    trace(message: string, ...args: unknown[]) {
        const log = this.formatMessage(message, ...args);

        // The log level of `trace` will append additional stack trace in
        // console, use `debug` level to prevent.
        console.debug(this.colorAndAddTimestamp(ELevel.Trace, log));
        this.channel.trace(log);
    }

    /**
     * Show debug level logs in the output channel, console (in dev mode).
     *
     * **NOTICE:** The message is only logged if configured displaying `DEBUG` log level or
     * lower log level (open command palette and select "Developer: Set Log Level..." to configure).
     *
     * @param message - The message to log
     * @param args - The arguments to log
     */
    debug(message: string, ...args: unknown[]) {
        const log = this.formatMessage(message, ...args);

        console.debug(this.colorAndAddTimestamp(ELevel.Debug, log));
        this.channel.debug(log);
    }

    /**
     * Show info level logs in the output channel, console (in dev mode) and window notification.
     *
     * **NOTICE:** The notification only show content of `message`, the content of `args` is omitted.
     *
     * @param message - The message to log
     * @param args - The arguments to log
     */
    info(message: string, ...args: unknown[]) {
        const log = this.formatMessage(message, ...args);

        console.info(this.colorAndAddTimestamp(ELevel.Info, log));
        this.channel.info(log);

        vscode.window.showInformationMessage(message);
    }

    /**
     * Show warning level logs in the output channel, console (in dev mode) and window notification.
     *
     * **NOTICE:** The notification only show content of `message`, the content of `args` is omitted.
     *
     * @param message - The message to log
     * @param args - The arguments to log
     */
    warn(message: string, ...args: unknown[]) {
        const log = this.formatMessage(message, ...args);

        console.warn(this.colorAndAddTimestamp(ELevel.Warn, log));
        this.channel.warn(log);

        vscode.window
            .showWarningMessage(message, kSeeDetails)
            .then(selection => {
                if (selection === kSeeDetails) {
                    this.channel.show(true);
                }
            });
    }

    /**
     * Show error level logs in the output channel, console (in dev mode) and window notification.
     *
     * **NOTICE:** The notification only show content of `message`, the content of `args` is omitted.
     *
     * @param message - The message to log
     * @param args - The arguments to log
     */
    error(message: string, ...args: unknown[]) {
        const log = this.formatMessage(message, ...args);

        console.error(this.colorAndAddTimestamp(ELevel.Error, log));
        this.channel.error(log);

        vscode.window.showErrorMessage(message, kSeeDetails).then(selection => {
            if (selection === kSeeDetails) {
                this.channel.show(true);
            }
        });
    }

    private formatMessage(message: string, ...args: unknown[]) {
        return format(
            message,
            ...args.map(arg => (arg instanceof Error ? arg.stack : arg ?? ""))
        );
    }

    private colorAndAddTimestamp(level: ELevel, message: string) {
        return format(
            `${mapLevelColor(level, `[%s] [%s]`)} %s`,
            nowDatetime(),
            level,
            message
        );
    }
}

/**
 * Map log level to color, `error` is red, `warn` is yellow, `info` is green,
 * `debug` is cyan, `trace` is blue.
 *
 * @param level - Log level
 * @param msg - Message to convert
 * @returns - Color string
 */
function mapLevelColor(level: ELevel, msg: string) {
    switch (level) {
        case ELevel.Error:
            return convertColor(EColor.Red, msg);
        case ELevel.Warn:
            return convertColor(EColor.Yellow, msg);
        case ELevel.Info:
            return convertColor(EColor.Green, msg);
        case ELevel.Debug:
            return convertColor(EColor.Cyan, msg);
        case ELevel.Trace:
            return convertColor(EColor.Blue, msg);
        default:
            return msg;
    }
}
