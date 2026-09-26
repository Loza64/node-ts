import { ValidationError } from 'class-validator';

export const flattenValidationErrors = (errors: ValidationError[], parentPath = ''): string[] =>
  errors.flatMap((error) => {
    const own = Object.values(error.constraints ?? {}).map((message) =>
      parentPath ? `${parentPath}.${message}` : message,
    );
    const path = parentPath ? `${parentPath}.${error.property}` : error.property;
    return [...own, ...flattenValidationErrors(error.children ?? [], path)];
  });
