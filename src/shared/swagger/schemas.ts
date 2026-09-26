import 'reflect-metadata';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';

import '../dto/id-ref.dto';
import '../pagination/pagination-query.dto';
import '../../modules/user/application/create-user.dto';

const getClassTransformerMetadataStorage = (): any => {
  const candidatePaths = ['class-transformer/cjs/storage', 'class-transformer/storage', 'class-transformer/esm5/storage'];

  for (const path of candidatePaths) {
    try {

      return require(path).defaultMetadataStorage;
    } catch {}
  }

  return undefined;
};

export const buildSwaggerDefinitions = (): Record<string, unknown> => {
  const classTransformerMetadataStorage = getClassTransformerMetadataStorage();

  const schemas = validationMetadatasToSchemas({
    refPointerPrefix: '#/components/schemas/',
    ...(classTransformerMetadataStorage ? { classTransformerMetadataStorage } : {}),
  });

  return schemas as Record<string, unknown>;
};
