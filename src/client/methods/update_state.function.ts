// This function updates the state of an object in the generic object service, given the issuerId, objectSuffix and the new state.
// It returns the issuerId.objectSuffix of the updated object.
// The function is called from the client service and finally from the client controller.

import { GoogleAuth } from "google-auth-library";
import * as google_credencial from '../../Archive/google-credentiales.json';
import { google } from "googleapis";


export async function updateObject(issuerId: String, objectSuffix: String, newEstado: String): Promise<String> {
    


    let credenciales_google = google_credencial

    const baseUrl = 'https://walletobjects.googleapis.com/walletobjects/v1';

    const httpClient = new GoogleAuth({
        credentials: credenciales_google,
        scopes: 'https://www.googleapis.com/auth/wallet_object.issuer'
    });
    let client = google.walletobjects({
        version: 'v1',
        auth: httpClient,
      });
    let response;


    try {
        response = await client.genericobject.get({
            resourceId: `${objectSuffix}`
        });
    } catch (err) {
        if (err.response && err.response.status === 404) {
            console.log(`Object ${objectSuffix} No encontrado!`);
            return `${objectSuffix}`;
        } else {
            console.log(err);
            return `${objectSuffix}`;
        }
    }
    let updatedObject = response.data;

    updatedObject.textModulesData.forEach((module: any) => {
        if (module.id === 'estado') {
            module.body = newEstado;
        }
    });

    try {
        response = await client.genericobject.update({
            resourceId: `${objectSuffix}`,
            requestBody: updatedObject
        });

        console.log('Object update response');
        console.log(response);

        return `${objectSuffix}`;
    } catch (error) {
        console.error('Error updating object:', error);
        return `${objectSuffix}`;
    }
}
