import { Injectable } from '@nestjs/common';
import { CurriculumRepository } from '../repositories/curriculum.repository';

@Injectable()
export class CurriculumPublicService {
  constructor(private readonly curriculumRepository: CurriculumRepository) {}

  execute(locale?: string) {
    const loc = locale && String(locale).trim() ? String(locale).trim() : 'pt-Br';
    return this.curriculumRepository.findPublishedByLocale(loc);
  }
}
