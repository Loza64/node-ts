import 'reflect-metadata';
import { createRequire } from 'module';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import type { MetadataStorage as ClassTransformerMetadataStorage } from 'class-transformer/types/MetadataStorage';

import '../dto/id-ref.dto';
import '../pagination/pagination-query.dto';
import '../../modules/user/application/create-user.dto';

const requireModule = createRequire(__filename);

const getClassTransformerMetadataStorage = (): ClassTransformerMetadataStorage | undefined => {
  const candidatePaths = ['class-transformer/cjs/storage', 'class-transformer/storage', 'class-transformer/esm5/storage'];

  for (const path of candidatePaths) {
    try {
      const mod = requireModule(path) as { defaultMetadataStorage?: ClassTransformerMetadataStorage };
      return mod.defaultMetadataStorage;
    } catch {
      // La ruta no existe en esta versión de class-transformer: se prueba la siguiente
    }
  }

  return undefined;
};

export const buildSwaggerDefinitions = (): Record<string, unknown> => {
  const classTransformerMetadataStorage = getClassTransformerMetadataStorage();

  const schemas = validationMetadatasToSchemas({
    refPointerPrefix: '#/components/schemas/',
    ...(classTransformerMetadataStorage ? { classTransformerMetadataStorage } : {}),
  });

  return schemas;
};
