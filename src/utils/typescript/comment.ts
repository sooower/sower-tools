export enum ECommentKind {
    SingleLine = "//",
    MultiLineStart = "/*",
    MultiLineEnd = "*/",
    DocCommentStart = "/**",
}

export function detectCommentKind(text: string): ECommentKind | null {
    const trimmed = text.trim();

    if (trimmed.startsWith(ECommentKind.DocCommentStart)) {
        return ECommentKind.DocCommentStart;
    }

    if (trimmed.startsWith(ECommentKind.SingleLine)) {
        return ECommentKind.SingleLine;
    }

    if (trimmed.startsWith(ECommentKind.MultiLineStart)) {
        return ECommentKind.MultiLineStart;
    }

    if (trimmed.includes(ECommentKind.MultiLineEnd)) {
        return ECommentKind.MultiLineEnd;
    }

    return null;
}
