import { defineModule } from "@/shared/moduleManager";

import { comment } from "./modules/comment";
import { returnStatement } from "./modules/returnStatement";

export const styleCheck = defineModule([comment, returnStatement]);
