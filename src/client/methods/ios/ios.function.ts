
import * as functions from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import passkit from "passkit-generator";
import type { Barcode, TransitType } from "passkit-generator";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";


export async function convertToWalletIOS(Datos: any) {
        
        const PKPass = passkit.PKPass;
        let adk = "************";
        let tokenUser = `${Datos.Nombre_Usuario}${Datos.Numero_Boleto}`;
        const issuerId = '**********';
        const classId = `${issuerId}.${adk}`;
        const storageRef = getStorage().bucket();

        
        let Data = JSON.stringify(Datos);
        let response;
        
        const pass = functions.https.onRequest(
            async (request: any, response) => {
                let modelBasePath: string;
        
                if (process.env.FUNCTIONS_EMULATOR === "true") {
                    modelBasePath = "../../models/";
                } else {
                    /**
                     * Models are cloned on deploy through
                     * the commands in `firebase.json` and
                     * are uploaded along with our program.
                     *
                     * When deployed, root folder is the `functions` folder
                     */
                    modelBasePath = "./models/";
                }
        
                try {
                    if (request.headers["content-type"] !== "application/json") {
                        response.status(400);
                        response.send({
                            error: `Payload with content-type ${request.headers["content-type"]} is not supported. Use "application/json"`,
                        });
                        return;
                    }
        
                    if (!request.body.passModel) {
                        response.status(400);
                        response.send({
                            error: "Unspecified 'passModel' parameter: which model should be used?",
                        });
        
                        return;
                    }
        
                    if (request.body.passModel.endsWith(".pass")) {
                        request.body.passModel = request.body.passModel.replace(
                            ".pass",
                            "",
                        );
                    }
        
                    const newPass = await PKPass.from(
                        {
                            /**
                             * Get relevant pass model from model folder (see passkit-generator/examples/models/)
                             * Path seems to get read like the function is in "firebase/" folder and not in "firebase/functions/"
                             */
                            model: `${modelBasePath}${request.body.passModel}.pass`,
                            certificates: {
                                // Assigning certificates from certs folder (you will need to provide these yourself)
                                wwdr: process.env.WWDR,
                                signerCert: process.env.SIGNER_CERT,
                                signerKey: process.env.SIGNER_KEY,
                                signerKeyPassphrase: process.env.SIGNER_KEY_PASSPHRASE,
                            },
                        },
                        {
                            serialNumber: request.body.serialNumber,
                            description: "DESCRIPTION",
                            logoText: request.body.logoText,
                            foregroundColor: request.body.textColor,
                            backgroundColor: request.body.backgroundColor,
                            labelColor: request.body.labelColor,
                        },
                    );
        
                    if (newPass.type == "boardingPass") {
                        if (!request.body.transitType) {
                            response.status(400);
                            response.send({
                                error: "transitType is required",
                            });
        
                            return;
                        }
        
                        newPass.transitType = request.body.transitType;
                    }
        
                    if (typeof request.body.relevantDate === "string") {
                        newPass.setRelevantDate(new Date(request.body.relevantDate));
                    }
        
                    if (typeof request.body.expiryDate === "string") {
                        newPass.setExpirationDate(new Date(request.body.expiryDate));
                        }
        
                    if (
                        request.body.relevantLocationLat &&
                        request.body.relevantLocationLong
                    ) {
                        newPass.setLocations({
                            latitude: request.body.relevantLocationLat,
                            longitude: request.body.relevantLocationLong,
                        });
                    }
        
                    if (Array.isArray(request.body.header)) {
                        for (let i = 0; i < request.body.header.length; i++) {
                            const field = request.body.header[i];
        
                            if (!(field?.label && field.value)) {
                                continue;
                            }
        
                            newPass.headerFields.push({
                                key: `header${i}`,
                                label: field.label,
                                value: field.value,
                            });
                        }
                    }
        
                    if (Array.isArray(request.body.primary)) {
                        for (let i = 0; i < request.body.primary.length; i++) {
                            const field = request.body.primary[i];
        
                            if (!(field?.label && field.value)) {
                                continue;
                            }
        
                            newPass.primaryFields.push({
                                key: `primary${i}`,
                                label: field.label,
                                value:
                                    newPass.type == "boardingPass"
                                        ? field.value.toUpperCase()
                                        : field.value,
                            });
                        }
                    }
        
                    if (Array.isArray(request.body.secondary)) {
                        for (let i = 0; i < request.body.secondary.length; i++) {
                            const field = request.body.secondary[i];
        
                            if (!(field?.label && field.value)) {
                                continue;
                            }
        
                            const isElementInLastTwoPositions =
                                i === request.body.secondary.length - 2 ||
                                i === request.body.secondary.length - 1;
        
                            newPass.secondaryFields.push({
                                key: `secondary${i}`,
                                label: field.label,
                                value: field.value,
                                textAlignment: isElementInLastTwoPositions
                                    ? "PKTextAlignmentRight"
                                    : "PKTextAlignmentLeft",
                            });
                        }
                    }
        
                    if (Array.isArray(request.body.auxiliary)) {
                        for (let i = 0; i < request.body.auxiliary.length; i++) {
                            const field = request.body.auxiliary[i];
        
                            if (!(field?.label && field.value)) {
                                continue;
                            }
        
                            const isElementInLastTwoPositions =
                                i === request.body.auxiliary.length - 2 ||
                                i === request.body.auxiliary.length - 1;
        
                            newPass.auxiliaryFields.push({
                                key: `auxiliary${i}`,
                                label: field.label,
                                value: field.value,
                                textAlignment: isElementInLastTwoPositions
                                    ? "PKTextAlignmentRight"
                                    : "PKTextAlignmentLeft",
                            });
                        }
                    }
        
                    if (request.body.qrText && request.body.codeType) {
                        newPass.setBarcodes({
                            message: request.body.qrText,
                            format: request.body.codeType,
                            messageEncoding: "iso-8859-1",
                            altText: request.body.codeAlt?.trim() ?? "",
                        });
                    }
        
                    const { thumbnailFile, logoFile } = request.body;
        
                    // Downloading thumbnail and logo files from Firebase Storage and adding to pass
                    if (newPass.type == "generic" || newPass.type == "eventTicket") {
                        if (thumbnailFile) {
                            const tempPath1 = path.join(os.tmpdir(), thumbnailFile);
        
                            try {
                                await storageRef
                                    .file(`thumbnails/${thumbnailFile}`)
                                    .download({ destination: tempPath1 });
        
                                const buffer = fs.readFileSync(tempPath1);
        
                                newPass.addBuffer("thumbnail.png", buffer);
                                newPass.addBuffer("thumbnail@2x.png", buffer);
                            } catch (error) {
                                console.error(error);
                            }
                        }
                    }
        
                    if (logoFile) {
                        const tempPath2 = path.join(os.tmpdir(), logoFile);
        
                        try {
                            await storageRef
                                .file(`logos/${logoFile}`)
                                .download({ destination: tempPath2 });
        
                            const buffer = fs.readFileSync(tempPath2);
        
                            newPass.addBuffer("logo.png", buffer);
                            newPass.addBuffer("logo@2x.png", buffer);
                        } catch (error) {
                            console.error(error);
                        }
                    }
        
                    const bufferData = newPass.getAsBuffer();
        
                    response.set("Content-Type", newPass.mimeType);
                    response.status(200).send(bufferData);
                } catch (error) {
                    console.log("Error Uploading pass " + error);
        
                    const err = Object.assign(
                        {},
                        ...Object.entries(Object.getOwnPropertyDescriptors(error)).map(
                            ([key, descriptor]) => {
                                return { [key]: descriptor.value };
                            },
                        ),
                    );
        
                    response.status(500);
                    response.send({
                        error: err,
                    });
                } 
            },
        )
    
};