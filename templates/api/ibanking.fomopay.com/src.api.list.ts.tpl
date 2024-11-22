import { HttpHandlerReq, HttpHandlerRes } from "@/modules/HttpHandler";

import { TSort as TSortGeneric } from "@/types/TSort";

export type TSort = TSortGeneric<"createdAt">;

export type TOptions = {};

export default async function txnGet(
    req: HttpHandlerReq,
    res: HttpHandlerRes,
    options: TOptions
) {}
