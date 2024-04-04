import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { User_Interface } from 'src/common/interfaces/user.interface';
import { validateOwnershipAdmin } from 'src/Guard/validateOwnerShip.guard';
import { enviarEmail } from './methods/sendEmail.function';
import { updateObject } from './methods/update_state.function';
@Injectable()
export class ClientService {
  constructor() {
    dotenv.config();
  }

  async send_Email(Data: any, user:User_Interface) {
    validateOwnershipAdmin(user);
    await enviarEmail(Data);
  }

  async updateObject(issuerId: String, objectSuffix: String, newEstado: String) {
    const result = await updateObject(issuerId, objectSuffix, newEstado);
    return result;
  } 

}
