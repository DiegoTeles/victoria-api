import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SocialLink } from '../../database/models/social-link.model';

@Injectable()
export class SocialLinksRepository {
  constructor(@InjectModel(SocialLink) private readonly model: typeof SocialLink) {}

  findPublicActive() {
    return this.model.findAll({
      where: { is_active: true },
      order: [
        ['sort_order', 'ASC'],
        ['network', 'ASC'],
      ],
    });
  }

  findAllAdmin() {
    return this.model.findAll({
      order: [
        ['sort_order', 'ASC'],
        ['network', 'ASC'],
      ],
    });
  }

  async create(values: {
    network: string;
    url: string;
    label: string | null;
    sort_order: number;
    is_active: boolean;
  }) {
    return this.model.create(values as any);
  }

  async update(
    id: string,
    values: {
      network: string;
      url: string;
      label: string | null;
      sort_order: number;
      is_active: boolean;
    },
  ) {
    const row = await this.model.findByPk(id);
    if (!row) return null;
    await row.update(values);
    return this.model.findByPk(id);
  }

  async deleteById(id: string): Promise<boolean> {
    const n = await this.model.destroy({ where: { id } });
    return n > 0;
  }
}
