import path from "path";

import { Client } from "minio";

import { extensionCtx, extensionName, format, logger, vscode } from "@/core";
import { CommonUtils } from "@utils/common";

import { uploadImageConfig } from "./configs";

export function registerCommandUploadImageToMinioStorage() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.markdownEnhancement.localImage.uploadToMinioStorage`,
            async (document: vscode.TextDocument, range: vscode.Range) => {
                vscode.window.withProgress(
                    {
                        location: vscode.ProgressLocation.Notification,
                        title: "Uploading image to minio storage",
                        cancellable: true,
                    },
                    async (progress, token) => {
                        try {
                            await uploadImage(document, range);
                        } catch (e) {
                            logger.error(`Upload failed.`, e);
                        }
                    }
                );
            }
        )
    );
}

async function uploadImage(document: vscode.TextDocument, range: vscode.Range) {
    const { endpoint, useSSL, accessKey, secretKey, bucketName } =
        uploadImageConfig;

    const imageAbsPath = path.resolve(
        path.dirname(document.uri.fsPath),
        document.getText(range)
    );

    CommonUtils.assert(
        /^.+\.(jpeg|jpg|png|gif|svg|webp)$/.test(imageAbsPath),
        `Unexpected image file extension "${imageAbsPath}".`
    );

    // Upload file

    const minioClient = new Client({
        endPoint: endpoint,
        useSSL,
        accessKey,
        secretKey,
    });

    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
        throw new Error(`Bucket "${bucketName}" not found.`);
    }

    const objectName = `${Date.now()}${path.extname(imageAbsPath)}`;
    await minioClient.fPutObject(bucketName, objectName, imageAbsPath, {
        contentType: "application/octet-stream",
    });

    // Generate remote image link

    const remoteImageLink = format(
        "%s://%s/%s/%s",
        useSSL ? "https" : "http",
        endpoint,
        bucketName,
        objectName
    );

    // Replace document content

    const edit = new vscode.WorkspaceEdit();
    edit.replace(document.uri, range, remoteImageLink);
    await vscode.workspace.applyEdit(edit);

    logger.info("Uploaded successfully!");
}
