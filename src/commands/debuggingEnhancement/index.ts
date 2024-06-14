import { subscribeDebugCurrentFile } from "./debugCurrentFile";
import { subscribeDebugProject } from "./debugProject";

export function subscribeDebuggingEnhancement() {
    subscribeDebugCurrentFile();
    subscribeDebugProject();
}
