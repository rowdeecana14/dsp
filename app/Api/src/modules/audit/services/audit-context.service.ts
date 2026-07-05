import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  userId?: string;
  userName?: string;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
  httpMethod?: string;
  endpoint?: string;
  statusCode?: number;
}

@Injectable()
export class AuditContextService {
  private readonly storage = new AsyncLocalStorage<RequestContext>();

  run(context: RequestContext, callback: () => Promise<any>): Promise<any> {
    return this.storage.run(context, callback);
  }

  get<T extends keyof RequestContext>(key: T): RequestContext[T] | undefined {
    const store = this.storage.getStore();
    return store?.[key];
  }

  set<T extends keyof RequestContext>(key: T, value: RequestContext[T]): void {
    let store = this.storage.getStore();

    if (!store) {
      store = {} as RequestContext;
      this.storage.enterWith(store);
    }

    store[key] = value;
  }

  getContext(): RequestContext | undefined {
    const store = this.storage.getStore();

    if (!store) {
      return {
        userId: 'system',
        userName: 'System',
        ipAddress: '127.0.0.1',
        userAgent: 'Seeder',
        httpMethod: 'SEED',
        endpoint: 'seed',
      };
    }

    return {
      userId: store.userId ?? 'system',
      userName: store.userName ?? 'System',
      ipAddress: store.ipAddress ?? '127.0.0.1',
      userAgent: store.userAgent ?? 'Seeder',
      httpMethod: store.httpMethod ?? 'SEED',
      endpoint: store.endpoint ?? 'seed',
      ...store,
    };
  }
}
