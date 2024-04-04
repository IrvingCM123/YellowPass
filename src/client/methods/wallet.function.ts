import { create_QR } from './qr.function';
import { GoogleAuth } from 'google-auth-library';
import * as jwt from 'jsonwebtoken';
import * as google_credencial from '../../Archive/google-credentiales.json';
import { generete_Class } from './wallet/class.function';
import { generate_response } from './wallet/response.function';
import { generate_Token } from './wallet/token.function';
import { generate_Object } from './wallet/object.function';
const { createShortUrl, decodeURL } = require('shortlnk');

export async function convertToWallet(Datos: any) {
    try {
        let adk = "flecha_1245";
        let tokenUser = `${Datos.Nombre_Usuario}${Datos.Numero_Boleto}`;
        let credenciales_google = google_credencial;
        const issuerId = '33880000000******';
        const classId = `${issuerId}.${adk}`;
        const baseUrl = 'https://walletobjects.googleapis.com/walletobjects/v1';

        const httpClient = new GoogleAuth({
            credentials: credenciales_google,
            scopes: 'https://www.googleapis.com/auth/wallet_object.issuer'
        });
        let Data = JSON.stringify(Datos);
        let response;
        
        let genericClass = await generete_Class(classId);

        await generate_response(classId, genericClass);

        let objectSuffix = `${Datos.Email.replace(/[^\w.-]/g, '_')}`;
        let objectId = `${issuerId}.${objectSuffix}${tokenUser}`;
        console.log(objectId);
        
        let genericObject = await generate_Object(objectId, classId, Datos);     
        console.log(genericObject);   
        let token = await generate_Token(genericObject);
        
          const saveUrl = `https://pay.google.com/gp/v/save/${token}`;
          console.log(saveUrl);
          const shortSaveUrl = await createShortUrl(saveUrl);

        return saveUrl;
    } catch (error) {
        throw new Error('Error al convertir a Wallet');
    }
}
