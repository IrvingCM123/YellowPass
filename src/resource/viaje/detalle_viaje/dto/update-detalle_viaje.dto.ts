import { PartialType } from '@nestjs/mapped-types';
import { CreateDetalleViajeDto } from './create-detalle_viaje.dto';

import { IsString, IsNotEmpty, IsNumber, Matches } from 'class-validator';
import { CatalogoDestino } from 'src/resource/catalogos/catalogo_destinos/entities/catalogo_destino.entity';

export class UpdateDetalleViajeDto extends PartialType(CreateDetalleViajeDto) {

    @IsNumber()
    @IsNotEmpty()
    ID_Origen: number;

    @IsNumber()
    @IsNotEmpty()
    ID_Destino: number;

    @IsString()
    @IsNotEmpty()
    @Matches(/^\d{2}-\d{2}-\d{4}$/) // Validar el formato de la fecha (dd-mm-yyyy)
    fecha_salida: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^\d{2}-\d{2}-\d{4}$/)
    fecha_llegada: string;

    @IsNumber()
    @IsNotEmpty()
    precio: number;

    @IsString()
    @IsNotEmpty()
    hora_salida: string;

    @IsString()
    @IsNotEmpty()
    hora_llegada: string;

}
