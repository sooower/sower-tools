import { defineModule } from "@/core";

import { blankLinesRemoval } from "./modules/blankLinesRemoval";
import { localImage } from "./modules/localImage";

export const markdownEnhancement = defineModule([
    blankLinesRemoval,
    localImage,
]);
