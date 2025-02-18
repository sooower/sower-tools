export enum kCommentKind {
    SingleLine = "//",
    MultiLineStart = "/*",
    MultiLineEnd = "*/",
    DocComment = "/**",
}

export function detectCommentKind(text: string): kCommentKind | null {
    const trimmed = text.trim();

    if (trimmed.startsWith(kCommentKind.DocComment)) {
        return kCommentKind.DocComment;
    }

    if (trimmed.startsWith(kCommentKind.SingleLine)) {
        return kCommentKind.SingleLine;
    }

    if (trimmed.includes(kCommentKind.MultiLineEnd)) {
        return kCommentKind.MultiLineEnd;
    }

    if (trimmed.startsWith(kCommentKind.MultiLineStart)) {
        return kCommentKind.MultiLineStart;
    }

    return null;
}
