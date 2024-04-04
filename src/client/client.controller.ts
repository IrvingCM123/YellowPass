import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Put } from '@nestjs/common';
import { ClientService } from './client.service';
import { Email_Interface } from 'src/common/interfaces/email.interface';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Rol } from 'src/common/enums/rol.enum';
import { ActiveUser } from 'src/common/decorators/user.decorator';
import { User_Interface } from 'src/common/interfaces/user.interface';

@Auth(Rol.ADMIN)
@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post('email')
  create(@Body() Data: Email_Interface, @ActiveUser() user: User_Interface) {
    return this.clientService.send_Email(Data, user);
  }

  @Put(':issuerId/:objectSuffix')
  async updateObject(
    @Param('issuerId') issuerId: String,
    @Param('objectSuffix') objectSuffix: String,
    @Body('newEstado') newEstado: String,
  ): Promise<String> {
    try {
      const result = await this.clientService.updateObject(issuerId, objectSuffix, newEstado);
      return result;
    } catch (error) {
      console.error('Error updating object:', error);
      throw error;
    }
  }



}
