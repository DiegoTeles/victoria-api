import type { FindOptions, Identifier, ModelStatic } from 'sequelize';
import { Model } from 'sequelize-typescript';

export class RecordNotFoundError extends Error {
  readonly modelName: string;
  readonly identifier: unknown;

  constructor(modelName: string, identifier: unknown) {
    super(`${modelName} not found`);
    this.name = 'RecordNotFoundError';
    this.modelName = modelName;
    this.identifier = identifier;
  }
}

export abstract class BaseModel extends Model {
  static async findByPkOrThrow<M extends BaseModel>(
    this: ModelStatic<M>,
    identifier: Identifier,
    options?: object,
  ): Promise<M> {
    const row = await this.findByPk(identifier, options as never);
    if (!row) {
      throw new RecordNotFoundError(this.name, identifier);
    }
    return row;
  }

  static async findOneOrThrow<M extends BaseModel>(
    this: ModelStatic<M>,
    options: FindOptions,
  ): Promise<M> {
    const row = await this.findOne(options);
    if (!row) {
      throw new RecordNotFoundError(this.name, options.where ?? null);
    }
    return row;
  }

  plain<T extends object = Record<string, unknown>>(): T {
    return this.get({ plain: true }) as T;
  }
}
