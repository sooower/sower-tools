import { parseMarkdownImageUploadConfigFilePath } from "./parseMarkdownImageUploadConfigFilePath";
import { parseMarkdownImageUploadEnable } from "./parseMarkdownImageUploadEnable";

export function parseConfigs() {
    parseMarkdownImageUploadEnable();
    parseMarkdownImageUploadConfigFilePath();
}
