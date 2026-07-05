import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditContextService } from '../services/audit-context.service';

@Injectable()
export class AuditRequestInterceptor implements NestInterceptor {
  constructor(private readonly auditContextService: AuditContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const authUser = request.auth?.user ?? request.user;
    if (authUser) {
      if (authUser.id) {
        this.auditContextService.set('userId', authUser.id);
      }
      if (authUser.name) {
        this.auditContextService.set('userName', authUser.name);
      }
    }

    return next.handle().pipe(
      tap({
        next: () => {
          if (response?.statusCode) {
            this.auditContextService.set('statusCode', response.statusCode);
          }
        },
        error: () => {
          if (response?.statusCode) {
            this.auditContextService.set('statusCode', response.statusCode);
          }
        },
      }),
    );
  }
}
