import { DatabaseConnection } from "@/modules/Database";
import { HttpHandlerReq, HttpHandlerRes } from "@/modules/HttpHandler";
import { FOMORemitError } from "@/modules/ProjectUtils";

export async function {{apiName}}ListGet(
    req: HttpHandlerReq,
    res: HttpHandlerRes
): Promise<void> {
    const hint = req.hint;

    let dbc: DatabaseConnection | undefined;

    try {
        // start your code here
    } catch (e) {
        console.error(hint, `Error while retrieving {{apiName}} list.`, e);
        if (e instanceof FOMORemitError) {
            res.status(e.httpStatusCode).json({
                hint: hint,
                code: e.code,
                message: e.message,
            });
            return;
        }
        throw e;
    } finally {
        dbc?.disconnect();
    }
}
