import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SocialLinksRepository } from '../repositories/social-links.repository';

@Injectable()
export class SocialLinksAdminService {
  constructor(private readonly socialLinksRepository: SocialLinksRepository) {}

  async list() {
    const rows = await this.socialLinksRepository.findAllAdmin();
    return rows.map((r) => ({
      id: String(r.id),
      network: r.network,
      url: r.url,
      label: r.label,
      sortOrder: r.sort_order,
      isActive: r.is_active,
      updatedAt: r.updatedAt,
    }));
  }

  async create(body: Record<string, unknown>) {
    const network = String(body.network || '').trim();
    const url = String(body.url || '').trim();
    if (!network || !url) {
      throw new BadRequestException('network and url are required');
    }
    const label = body.label == null ? null : String(body.label);
    const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0;
    const isActive = body.isActive !== false;
    try {
      const r = await this.socialLinksRepository.create({
        network,
        url,
        label,
        sort_order: sortOrder,
        is_active: isActive,
      });
      return {
        id: String(r.id),
        network: r.network,
        url: r.url,
        label: r.label,
        sortOrder: r.sort_order,
        isActive: r.is_active,
        updatedAt: r.updatedAt,
      };
    } catch {
      throw new InternalServerErrorException('Failed to create social link');
    }
  }

  async update(id: string, body: Record<string, unknown>) {
    const network = String(body.network || '').trim();
    const url = String(body.url || '').trim();
    if (!network || !url) {
      throw new BadRequestException('network and url are required');
    }
    const label = body.label == null ? null : String(body.label);
    const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0;
    const isActive = body.isActive !== false;
    try {
      const r = await this.socialLinksRepository.update(id, {
        network,
        url,
        label,
        sort_order: sortOrder,
        is_active: isActive,
      });
      if (!r) throw new NotFoundException('Not found');
      return {
        id: String(r.id),
        network: r.network,
        url: r.url,
        label: r.label,
        sortOrder: r.sort_order,
        isActive: r.is_active,
        updatedAt: r.updatedAt,
      };
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new InternalServerErrorException('Failed to update social link');
    }
  }

  async remove(id: string) {
    const ok = await this.socialLinksRepository.deleteById(id);
    if (!ok) throw new NotFoundException('Not found');
    return { ok: true };
  }
}
