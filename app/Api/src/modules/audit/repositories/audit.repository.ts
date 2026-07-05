import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity } from '../entities/audit-log.entity';
import { AuditQueryDto } from '../dto/audit-query.dto';

@Injectable()
export class AuditRepository {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly repository: Repository<AuditLogEntity>,
  ) {}

  async findById(id: string): Promise<AuditLogEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByUser(userId: string): Promise<AuditLogEntity[]> {
    return this.repository.find({ where: { user_id: userId }, order: { created_at: 'DESC' } });
  }

  async findByEntity(entityName: string, entityId: string): Promise<AuditLogEntity[]> {
    return this.repository.find({ where: { entity_name: entityName, entity_id: entityId }, order: { created_at: 'DESC' } });
  }

  async search(query: AuditQueryDto): Promise<{ data: AuditLogEntity[]; total: number }> {
    const qb = this.repository.createQueryBuilder('audit');

    if (query.user_id) qb.andWhere('audit.user_id = :userId', { userId: query.user_id });
    if (query.entity) qb.andWhere('audit.entity_name = :entity', { entity: query.entity });
    if (query.entity_id) qb.andWhere('audit.entity_id = :entityId', { entityId: query.entity_id });
    if (query.action) qb.andWhere('audit.action = :action', { action: query.action });
    if (query.module) qb.andWhere('audit.module = :module', { module: query.module });
    if (query.request_id) qb.andWhere('audit.request_id = :requestId', { requestId: query.request_id });
    if (query.start_date) qb.andWhere('audit.created_at >= :startDate', { startDate: query.start_date });
    if (query.end_date) qb.andWhere('audit.created_at <= :endDate', { endDate: query.end_date });
    if (query.actions?.length) qb.andWhere('audit.action IN (:...actions)', { actions: query.actions });
    if (query.modules?.length) qb.andWhere('audit.module IN (:...modules)', { modules: query.modules });

    const sortBy = query.sort_by ?? 'created_at';
    const sortDirection = query.sort_direction ?? 'DESC';

    qb.orderBy(`audit.${sortBy}`, sortDirection);

    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, query.page_size ?? 25);

    qb.skip((page - 1) * pageSize).take(pageSize);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }
}
