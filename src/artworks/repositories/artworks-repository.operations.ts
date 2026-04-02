export const ArtworkRepositoryOps = {
  findAllOrdered: 'findAllOrdered',
  findById: 'findById',
  create: 'create',
  update: 'update',
  deleteById: 'deleteById',
  findBlobFieldsById: 'findBlobFieldsById',
} as const;

export type ArtworkRepositoryOp = (typeof ArtworkRepositoryOps)[keyof typeof ArtworkRepositoryOps];
