import path from "node:path";

import { parse } from "comment-json";

import { fs } from "@/shared";
import { getWorkspaceFolderPath } from "@/shared/utils/vscode";
import { CommonUtils } from "@utils/common";

export function getDebuggingConfigurations(): any[] {
    try {
        const launch = CommonUtils.assertObjectHasKeys(
            loadLaunchJsonContent(),
            ["configurations"]
        );

        const configurations = launch.configurations;
        CommonUtils.assert(
            CommonUtils.isArray(configurations) && configurations.length > 0,
            "launch.json must have at least one configuration."
        );

        return configurations;
    } catch (e) {
        throw new Error(`Failed to load launch.json. ${e}`);
    }
}

export function loadLaunchJsonContent() {
    const launchConfigPath = path.join(
        getWorkspaceFolderPath(),
        ".vscode",
        "launch.json"
    );
    CommonUtils.assert(
        fs.existsSync(launchConfigPath),
        `Launch file "./.vscode/launch.json" is not exists.`
    );
    const content = fs.readFileSync(launchConfigPath, "utf8");

    return parse(content);
}
