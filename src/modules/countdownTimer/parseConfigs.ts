import z from "zod";

import { getConfigurationItem } from "@/shared/configuration";
import { extensionName } from "@/shared/context";

import { kRestore } from "./consts";

const countdownTimerOptionSchema = z.object({
    label: z.string(),
    duration: z
        .number()
        .positive()
        .transform(it => it * 1000),
});

export type TCountdownTimerOption = z.infer<typeof countdownTimerOptionSchema>;

export let countdownTimerOptions: TCountdownTimerOption[];

export function parseCountdownTimerConfigs() {
    countdownTimerOptions = [
        { label: kRestore, duration: 0 } satisfies TCountdownTimerOption,
    ].concat(
        ...z
            .array(countdownTimerOptionSchema)
            .optional()
            .default([])
            .parse(
                getConfigurationItem(`${extensionName}.countdownTimer.options`)
            )
    );
}
