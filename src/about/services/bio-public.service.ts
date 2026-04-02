import { Injectable } from '@nestjs/common';
import { BioRepository } from '../repositories/bio.repository';

@Injectable()
export class BioPublicService {
  constructor(private readonly bioRepository: BioRepository) {}

  execute(locale?: string) {
    const loc = locale && String(locale).trim() ? String(locale).trim() : 'pt-Br';
    return this.bioRepository.findPublishedByLocale(loc);
  }
}
