import * as SendGrid from '@sendgrid/mail';
import { email_template } from '../template/email.template';
import { convert_Image } from './image.function';
import * as dotenv from 'dotenv';
import { convertToWallet} from './wallet.function';
import * as nodemailer from "nodemailer";
import { convertToWalletIOS } from './ios/ios.function';

dotenv.config();

export async function enviarEmail(Data: any): Promise<string> {
    try {

      const Destinatario = Data.Destinatario;
      const Datos = Data.Data;

      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "bagdiana03@gmail.com",
          pass: "upwlojvmpxuahhyy",
        },
      });

      let imagen_boleto_path = await convert_Image(Datos);

      let url_wallet = await convertToWallet(Datos);
      
      let url_wallet_ios = await convertToWalletIOS(Datos);

      const html_template = email_template(Datos, imagen_boleto_path, url_wallet, url_wallet_ios);

      const msg = {
        to: Destinatario,
        from: 'bagdiana03@gmail.com',
        subject: 'Ya tienes tu boleto!',
        html: html_template,
      };

      transporter.sendMail(msg, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Correo electrónico enviado: " + info.response);
        }
      });
      return 'Correo electrónico enviado correctamente';
    } catch (error) {
      throw new Error('Error al enviar el correo electrónico');
    }
  }

