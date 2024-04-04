import { DetalleVehiculosModule } from './../../transportes/detalle_vehiculos/detalle_vehiculos.module';
import { Module } from '@nestjs/common';
import { ViajeService } from './viaje.service';
import { ViajeController } from './viaje.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Viaje } from './entities/viaje.entity';
import { DetalleViaje } from '../detalle_viaje/entities/detalle_viaje.entity';
import { DetalleVehiculo } from '../../transportes/detalle_vehiculos/entities/detalle_vehiculo.entity';
import { Conductore } from 'src/resource/conductores/entities/conductore.entity';
import { DetalleViajeModule } from '../detalle_viaje/detalle_viaje.module';
import { ConductoresModule } from '../../conductores/conductores.module';
import { CatalogoDestino } from 'src/resource/catalogos/catalogo_destinos/entities/catalogo_destino.entity';
import { CatalogoDestinosModule } from 'src/resource/catalogos/catalogo_destinos/catalogo_destinos.module';
import { ValidationModule } from 'src/common/validation/validation.module';
import { QuerysModule } from 'src/common/sql/sql.module';
@Module({
  imports: [TypeOrmModule.forFeature([Viaje, DetalleVehiculo, Conductore, DetalleViaje, CatalogoDestino ]), DetalleViajeModule, ConductoresModule, DetalleVehiculosModule, CatalogoDestinosModule, ValidationModule, QuerysModule ],
  controllers: [ViajeController],
  providers: [ViajeService],
  exports: [ViajeService]
})
export class ViajeModule {}
