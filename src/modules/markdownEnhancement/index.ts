import { defineModule } from "@/core/moduleManager";

import { blankLinesRemoval } from "./modules/blankLinesRemoval";
import { localImage } from "./modules/localImage";

export const markdownEnhancement = defineModule([
    blankLinesRemoval,
    localImage,
]);
