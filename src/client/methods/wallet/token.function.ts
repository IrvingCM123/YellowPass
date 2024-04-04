import * as jwt from 'jsonwebtoken';
import * as google_credencial from '../../../Archive/google-credentiales.json';

// Exported function for generating a token, which will be necessary for redirection
// to the Google Wallet application, storing the generic_object (ticket) in the application

export async function generate_Token(genericObject: any) {
  let credenciales_google = google_credencial;

  const claims = {
    iss: credenciales_google.client_email,
    aud: 'google',
    origins: [],
    typ: 'savetowallet',
    payload: {
      genericObjects: [
        genericObject
      ]
    }
  };

  const token = jwt.sign(claims, credenciales_google.private_key, { algorithm: 'RS256' });

  return token;
}
