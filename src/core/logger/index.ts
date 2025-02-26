import { extensionCtx, extensionDisplayName, format, vscode } from "@/core";
import { datetime } from "@utils/datetime";

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
    private channel: vscode.LogOutputChannel;

    constructor() {
        this.channel = vscode.window.createOutputChannel(extensionDisplayName, {
            log: true,
        });
        extensionCtx.subscriptions.push(this.channel);
    }

    /**
     * Show trace level logs in the output channel, console ( in dev mode).
     *
     * **NOTICE:** The message is only logged if configured displaying `trace` log level
     * (open command palette and select "Developer: Set Log Level..." to configure).
     *
     * @param message - The message to log
     * @param args - The arguments to log
     */
    trace(message: string, ...args: unknown[]) {
        const log = this.formatMessage(message, ...args);

        // The log level of `trace` will append additional stack trace in
        // console, use `debug` level to prevent.
        console.debug(this.addTimestamp(ELevel.Trace, log));
        this.channel.trace(log);
    }

    /**
     * Show debug level logs in the output channel, console ( in dev mode).
     *
     * **NOTICE:** The message is only logged if configured displaying `debug` log level or
     * lower log level (open command palette and select "Developer: Set Log Level..." to configure).
     *
     * @param message - The message to log
     * @param args - The arguments to log
     */
    debug(message: string, ...args: unknown[]) {
        const log = this.formatMessage(message, ...args);

        console.debug(this.addTimestamp(ELevel.Debug, log));
        this.channel.debug(log);
    }

    /**
     * Show info level logs in the output channel, console ( in dev mode) and window notification.
     *
     * **NOTICE:** The notification only show content of `message`, the content of `args` is omitted.
     *
     * @param message - The message to log
     * @param args - The arguments to log
     */
    info(message: string, ...args: unknown[]) {
        const log = this.formatMessage(message, ...args);

        console.info(this.addTimestamp(ELevel.Info, log));
        this.channel.info(log);

        vscode.window.showInformationMessage(message);
    }

    /**
     * Show warning level logs in the output channel, console ( in dev mode) and window notification.
     *
     * **NOTICE:** The notification only show content of `message`, the content of `args` is omitted.
     *
     * @param message - The message to log
     * @param args - The arguments to log
     */
    warn(message: string, ...args: unknown[]) {
        const log = this.formatMessage(message, ...args);

        console.warn(this.addTimestamp(ELevel.Warn, log));
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
     * Show error level logs in the output channel, console ( in dev mode) and window notification.
     *
     * **NOTICE:** The notification only show content of `message`, the content of `args` is omitted.
     *
     * @param message - The message to log
     * @param args - The arguments to log
     */
    error(message: string, ...args: unknown[]) {
        const log = this.formatMessage(message, ...args);

        console.error(this.addTimestamp(ELevel.Error, log));
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

    private addTimestamp(level: ELevel, message: string) {
        return format(
            `[%s] [%s] %s`,
            datetime().format("YYYY-MM-DD HH:mm:ss.SSS"),
            level,
            message
        );
    }
}
