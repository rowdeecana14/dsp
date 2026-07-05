import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ViewerStateEntity } from './entities/viewer-state.entity';

@Injectable()
export class ViewerStateRepository {
  constructor(
    @InjectRepository(ViewerStateEntity)
    private readonly repository: Repository<ViewerStateEntity>,
  ) {}

  async findByStudyAndUser(studyInstanceUID: string, userId: string) {
    return this.repository.findOne({ where: { study_instance_uid: studyInstanceUID, user_id: userId } });
  }

  async saveState(state: ViewerStateEntity) {
    return this.repository.save(state);
  }
}
