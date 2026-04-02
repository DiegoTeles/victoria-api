import { Injectable } from '@nestjs/common';
import { SocialLinksRepository } from '../repositories/social-links.repository';

@Injectable()
export class SocialLinksPublicService {
  constructor(private readonly socialLinksRepository: SocialLinksRepository) {}

  async execute() {
    const rows = await this.socialLinksRepository.findPublicActive();
    return rows.map((r) => ({
      id: String(r.id),
      network: r.network,
      url: r.url,
      label: r.label,
      sortOrder: r.sort_order,
    }));
  }
}
