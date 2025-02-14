import { parseMarkdownImageUploadConfigFilePath } from "./markdownImageUploadConfigFilePath";
import { parseMarkdownImageUploadEnable } from "./markdownImageUploadEnable";

export function parseConfigs() {
    parseMarkdownImageUploadEnable();
    parseMarkdownImageUploadConfigFilePath();
}
