import { Injectable } from '@nestjs/common';
import { CreateDetalleVehiculoDto } from './dto/create-detalle_vehiculo.dto';
import { UpdateDetalleVehiculoDto } from './dto/update-detalle_vehiculo.dto';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User_Interface } from 'src/common/interfaces/user.interface';
import { CatalogoVehiculo } from 'src/resource/catalogos/catalogo_vehiculos/entities/catalogo_vehiculo.entity';

import { DetalleVehiculo } from './entities/detalle_vehiculo.entity';
import { validateOwnershipAdmin } from 'src/Guard/validateOwnerShip.guard';

import { Errores_Catalogos, Errores_Vehiculos } from 'src/common/helpers/Errores.service';
import { Exito_Vehiculos } from 'src/common/helpers/Confirmaciones.service';

@Injectable()
export class DetalleVehiculosService {
  constructor(
    @InjectRepository(DetalleVehiculo)
    private detalleVehiculoRepository: Repository<DetalleVehiculo>,
    @InjectRepository(CatalogoVehiculo)
    private catalogoVehiculoRepository: Repository<CatalogoVehiculo>,
  ) {}

  async create(
    createDetalleVehiculoDto: CreateDetalleVehiculoDto,
    user: User_Interface,
  ) {
    validateOwnershipAdmin(user);

    let buscar = await this.detalleVehiculoRepository.findOne({
      where: { numero_placas: createDetalleVehiculoDto.numero_placas },
    });

    let tipo = createDetalleVehiculoDto.TipoVehiculo.toString();

    let buscar_tipo = await this.catalogoVehiculoRepository.findOne({
      where: { TipoVehiculo: tipo },
    });

    if (buscar_tipo == null) {
      return Errores_Catalogos.CATALOG_NOT_FOUND;
    }
    
    let detalle_vehiculo = {
      marca: createDetalleVehiculoDto.marca,
      modelo: createDetalleVehiculoDto.modelo,
      numero_placas: createDetalleVehiculoDto.numero_placas,
      id_catalogo_vehiculo: buscar_tipo.id_catalogo_vehiculo,
      capacidad_asientos: createDetalleVehiculoDto.capacidad_asientos,
    };

    if (buscar == null) {
      this.detalleVehiculoRepository.save(detalle_vehiculo);
      return Exito_Vehiculos.VEHICULO_CREADO;
    } else {
      return Errores_Vehiculos.VEHICLE_ALREADY_EXISTS;
    }
  }

  findAll( user: User_Interface) {
    validateOwnershipAdmin(user);
    return this.detalleVehiculoRepository.find();
  }

  findOne(id: number, user: User_Interface) {
    validateOwnershipAdmin(user);

    try {
      return this.detalleVehiculoRepository.findOneById(id);
    } catch (error) {
      return Errores_Vehiculos.VEHICLE_NOT_FOUND;
    }
  }

  update(
    id: number,
    updateDetalleVehiculoDto: UpdateDetalleVehiculoDto,
    user: User_Interface,
  ) {
    validateOwnershipAdmin(user);

    try {
      this.detalleVehiculoRepository.update(id, updateDetalleVehiculoDto);
      return Exito_Vehiculos.VEHICULO_ACTUALIZADO;
    } catch (error) {
      return Errores_Vehiculos.VEHICLE_NOT_FOUND;
    }
  }

  remove(id: number, user: User_Interface) {
    validateOwnershipAdmin(user);

    try {
      this.detalleVehiculoRepository.delete(id);
      return Exito_Vehiculos.VEHICULO_ELIMINADO;
    } catch (error) {
      return Errores_Vehiculos.VEHICLE_NOT_FOUND;
    }
  }
}
