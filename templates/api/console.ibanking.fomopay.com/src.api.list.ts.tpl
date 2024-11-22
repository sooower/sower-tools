import accessController from "@/modules/AccessController";
import { HttpHandlerReq, HttpHandlerRes } from "@/modules/HttpHandler";
import { IBankingError } from "@/modules/ProjectUtils";
import {
    kWebAuthenticationPayloadKey,
    TWebAuthenticationPayload,
} from "@/modules/WebAuthentication";

import { EEndpoints } from "@/types/EEndpoints";
import { TSort as TSortGeneric } from "@/types/TSort";

const endpoint = EEndpoints.ApiGetAccounts;

export type TSort = TSortGeneric<"createdAt">;

export type TOptions = {};

export default async function txnGet(
    req: HttpHandlerReq,
    res: HttpHandlerRes,
    options: TOptions
) {
    const { role } = req.data.get<TWebAuthenticationPayload>(
        kWebAuthenticationPayloadKey
    );
    if (!accessController.check(role, endpoint)) {
        throw new IBankingError(403, "-2001", `Permission is not granted.`);
    }
}
