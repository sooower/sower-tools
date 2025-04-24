import { format } from "node:util";

/**
 *  Terminal ANSI color enum
 */
export enum EColor {
    Red = "31",
    Green = "32",
    Yellow = "33",
    Blue = "34",
    Magenta = "35",
    Cyan = "36",
    White = "37",
    Black = "30",
    Orange = "38;5;214",
}

/**
 *  Convert to terminal ANSI color string
 *
 * @param color - Color enum
 * @param text - Text to convert
 * @returns - ANSI color string
 */
export function convertColor(color: EColor, ...text: unknown[]): string {
    return `\x1b[${color}m${format(...text)}\x1b[0m`;
}

/**
 *  Terminal ANSI background color enum
 */
export enum EBackgroundColor {
    Red = "160",
    Green = "2",
    Orange = "172",
    Black = "0",
    White = "15",
}

/**
 *  Convert to terminal ANSI background color string
 *
 * @param color - Background color enum
 * @param text - Text to convert, format with `util.format`.
 * @returns - ANSI background color string
 */
export function convertBackgroundColor(
    color: EBackgroundColor,
    ...text: unknown[]
): string {
    return `\x1b[48;5;${color}m${format(...text)}\x1b[0m`;
}
