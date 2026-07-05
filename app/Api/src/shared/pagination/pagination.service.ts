import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import { PaginationDto, SortOrder } from './pagination.dto';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    last_page: number;
    sort_by: string;
    sort_order: SortOrder;
  };
}

export interface PaginationSortOptions {
  allowedSortFields: readonly string[];
  sortFieldMap?: Record<string, string>;
  defaultSortField?: string;
  defaultSortOrder?: SortOrder;
}

function applyPagination<T extends ObjectLiteral>(qb: SelectQueryBuilder<T>, page: number, limit: number) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  qb.skip((safePage - 1) * safeLimit).take(safeLimit);
}

function normalizeSortField(sortBy: string | undefined, allowedSortFields: readonly string[], defaultField: string) {
  const normalizedSortBy = sortBy?.trim();
  if (!normalizedSortBy) {
    return defaultField;
  }
  return allowedSortFields.includes(normalizedSortBy) ? normalizedSortBy : defaultField;
}

function normalizeSortOrder(sortOrder: SortOrder | undefined, defaultOrder: SortOrder = SortOrder.ASC): SortOrder {
  return sortOrder === SortOrder.DESC ? SortOrder.DESC : defaultOrder;
}

function applySorting<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  alias: string,
  sortBy: string | undefined,
  sortOrder: SortOrder | undefined,
  options: PaginationSortOptions,
) {
  const defaultField = options.defaultSortField ?? 'created_at';
  const defaultOrder = options.defaultSortOrder ?? SortOrder.ASC;
  const field = normalizeSortField(sortBy, options.allowedSortFields, defaultField);
  const order = normalizeSortOrder(sortOrder, defaultOrder);
  const resolvedColumn = options.sortFieldMap?.[field] ?? field;

  qb.orderBy(`${alias}.${resolvedColumn}`, order);

  return { sort_by: field, sort_order: order };
}

export interface BasePaginationOptions<TEntity extends ObjectLiteral, TResult>
  extends Omit<PaginationSortOptions, 'allowedSortFields'> {
  allowedSortFields?: readonly string[];
  buildQuery?: (qb: SelectQueryBuilder<TEntity>) => SelectQueryBuilder<TEntity> | void;
  transform?: (entity: TEntity) => TResult;
}

export abstract class PaginationService<TEntity extends ObjectLiteral, TResult = TEntity> {
  protected abstract readonly alias: string;
  protected abstract readonly allowedSortFields: readonly string[];
  protected readonly defaultSortField = 'created_at';
  protected readonly defaultSortOrder = SortOrder.ASC;
  protected readonly sortFieldMap: Record<string, string> = {};

  protected async paginate(
    repository: Repository<TEntity>,
    query: PaginationDto,
    options: BasePaginationOptions<TEntity, TResult> = {},
  ): Promise<PaginatedResult<TResult>> {
    const baseQb = repository.createQueryBuilder(this.alias);
    const qb = options.buildQuery?.(baseQb) ?? baseQb;
    const { sort_by, sort_order } = applySorting(qb, this.alias, query.sort_by, query.sort_order, {
      allowedSortFields: options.allowedSortFields ?? this.allowedSortFields,
      sortFieldMap: options.sortFieldMap ?? this.sortFieldMap,
      defaultSortField: options.defaultSortField ?? this.defaultSortField,
      defaultSortOrder: options.defaultSortOrder ?? this.defaultSortOrder,
    });

    applyPagination(qb, query.page, query.limit);

    const [data, total] = await qb.getManyAndCount();
    const transform = options.transform ?? ((entity: TEntity) => entity as unknown as TResult);

    return {
      data: data.map(transform),
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        last_page: query.limit > 0 ? Math.ceil(total / query.limit) : 0,
        sort_by,
        sort_order,
      },
    };
  }
}

export default PaginationService;
