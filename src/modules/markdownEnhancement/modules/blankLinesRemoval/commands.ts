import { ViewColumn } from "vscode";

import { extensionCtx, extensionName, logger, vscode } from "@/core";

import { languageIds, skipFirstLine } from "./configs";

export function registerCommands() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.markdownEnhancement.removeBlankLinesAndOpenInNewDocument`,
            async (document: vscode.TextDocument, range: vscode.Range) => {
                try {
                    await vscode.window.showTextDocument(
                        await vscode.workspace.openTextDocument({
                            content: await filterBlankLines(document, range),
                            language: "markdown",
                        }),
                        ViewColumn.Beside
                    );
                } catch (e) {
                    logger.error(
                        "Failed to remove blank lines and open in new document.",
                        e
                    );
                }
            }
        ),
        vscode.commands.registerCommand(
            `${extensionName}.markdownEnhancement.removeBlankLinesAndCopyToClipboard`,
            async (document: vscode.TextDocument, range: vscode.Range) => {
                try {
                    await vscode.env.clipboard.writeText(
                        await filterBlankLines(document, range)
                    );
                } catch (e) {
                    logger.error(
                        "Failed to remove blank lines and copy to clipboard.",
                        e
                    );
                }
            }
        )
    );
}

export async function filterBlankLines(
    document: vscode.TextDocument,
    range: vscode.Range
): Promise<string> {
    const lines = document.getText(range).split("\n");

    let isInsideCodeBlock = false;
    const outputLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        if (
            skipFirstLine &&
            i === 0 &&
            document.lineAt(range.start).lineNumber === 0
        ) {
            continue;
        }

        const line = lines[i];

        const languageIdsRegex = languageIds.join("|");
        const codeBlockStartRegex = `^\\s*\`\`\`(${languageIdsRegex})(\\s|$)`;

        if (line.match(codeBlockStartRegex) !== null) {
            outputLines.push(line);
            isInsideCodeBlock = true;

            continue;
        }
        if (line.match(`^\\s*\`\`\`(\\s|$)`) !== null) {
            outputLines.push(line);
            isInsideCodeBlock = false;

            continue;
        }

        // Maintain all lines (including blank lines) inside code blocks
        if (isInsideCodeBlock) {
            outputLines.push(line);

            continue;
        }

        // Keep non-blank lines outside of code blocks
        if (line.trim() !== "") {
            outputLines.push(line);
        }
    }

    return outputLines.join("\n");
}
