import { extensionCtx, extensionName, vscode } from "@/core";
import { getTrimmedLineText } from "@/utils/vscode";

import { patterns } from "./configs";

export function registerCompletionItemProviders() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            "typescript",
            new LogPrintingCompletionItemProvider(),
            "."
        )
    );
}

class LogPrintingCompletionItemProvider
    implements vscode.CompletionItemProvider
{
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.CompletionItem[] | Thenable<vscode.CompletionItem[]> {
        const match = getTrimmedLineText(document, position.line).match(
            /(.+)\.(\w+)$/
        );
        if (match === null) {
            return [];
        }

        const [_, varName, suffix] = match;

        return patterns
            .filter(pattern =>
                // Matched pattern when the suffix of the input is a sub sequence of the pattern suffix
                pattern.trigger.split(".")[1].trim().includes(suffix.trim())
            )
            .map(pattern => {
                const replacement = pattern.replacement.replace(
                    /{{varName}}/g,
                    varName
                );
                const varRange = new vscode.Range(
                    position.line,
                    position.character - varName.length - 1 - suffix.length,
                    position.line,
                    position.character
                );

                const item = new vscode.CompletionItem(
                    `→ ${pattern.trigger.split(".")[1]}`,
                    vscode.CompletionItemKind.Snippet
                );

                item.insertText = replacement;
                item.additionalTextEdits = [vscode.TextEdit.delete(varRange)];
                item.detail = `Print log to the console (@${extensionName})`;
                item.documentation = new vscode.MarkdownString(
                    `\`\`\`ts\n${replacement}\n\`\`\``
                );

                return item;
            });
    }
}
