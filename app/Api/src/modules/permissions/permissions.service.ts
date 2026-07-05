import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionEntity } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permRepo: Repository<PermissionEntity>,
  ) {}

  async create(dto: CreatePermissionDto) {
    const name = dto.name.trim().toLowerCase();

    const existing = await this.permRepo.findOne({ where: { name: name } });
    if (existing) {
      throw new BadRequestException('Permission name already exists');
    }

    const p = this.permRepo.create({ name: name, display_name: dto.display_name });
    return this.permRepo.save(p);
  }

  async findAll() {
    return this.permRepo.find();
  }

  async findOne(id: string) {
    const p = await this.permRepo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Permission not found');
    return p;
  }

  async update(id: string, dto: UpdatePermissionDto) {
    const p = await this.findOne(id);
    if (dto.name) {
      const name = dto.name.trim().toLowerCase();
      if (name !== p.name) {
        const existing = await this.permRepo.findOne({ where: { name: name } });
        if (existing && existing.id !== p.id) {
          throw new BadRequestException('Permission name already exists');
        }
      }
      p.name = name;
    }
    if (dto.display_name !== undefined) p.display_name = dto.display_name;
    return this.permRepo.save(p);
  }

  async remove(id: string) {
    const p = await this.findOne(id);
    return this.permRepo.softRemove(p);
  }
}
