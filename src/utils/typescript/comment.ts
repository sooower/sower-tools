export const kCommentType = {
    SingleLine: "//",
    MultiLineStart: "/*",
    MultiLineEnd: "*/",
    DocComment: "/**",
};

export function detectCommentType(text: string): string | null {
    const trimmed = text.trim();

    if (trimmed.startsWith(kCommentType.DocComment)) {
        return kCommentType.DocComment;
    }

    if (trimmed.startsWith(kCommentType.SingleLine)) {
        return kCommentType.SingleLine;
    }

    if (trimmed.includes(kCommentType.MultiLineEnd)) {
        return kCommentType.MultiLineEnd;
    }

    if (trimmed.startsWith(kCommentType.MultiLineStart)) {
        return kCommentType.MultiLineStart;
    }

    return null;
}
