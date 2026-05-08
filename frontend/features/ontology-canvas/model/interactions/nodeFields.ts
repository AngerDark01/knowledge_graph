import type {
  OntologyField,
  OntologyFieldCategory,
  OntologyNode,
} from '@/domain/ontology';

export type CreateDefaultOntologyFieldInput = {
  nodeId: string;
  existingFields: readonly OntologyField[];
  fieldId?: string;
  namePrefix?: string;
  category?: OntologyFieldCategory;
  dataType?: string;
  value?: string;
};

export type DefaultOntologyFieldCategoryInput = Pick<
  CreateDefaultOntologyFieldInput,
  'category' | 'dataType' | 'namePrefix'
>;

export type UpdateOntologyFieldPatch = Partial<Pick<
  OntologyField,
  'name' | 'value' | 'dataType' | 'category'
>>;

export type MoveOntologyFieldDirection = 'up' | 'down';

const normalizeFieldName = (name: string): string => name.trim().toLowerCase();

const normalizeOptionalText = (value: string | undefined): string | undefined => {
  if (value === undefined) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const createUniqueOntologyFieldName = (
  existingFields: readonly Pick<OntologyField, 'name'>[],
  prefix = 'attribute'
): string => {
  const existingNames = new Set(
    existingFields.map(field => normalizeFieldName(field.name))
  );
  const baseName = prefix.trim() || 'attribute';

  if (!existingNames.has(normalizeFieldName(baseName))) {
    return baseName;
  }

  let index = 2;
  while (existingNames.has(normalizeFieldName(`${baseName}${index}`))) {
    index += 1;
  }

  return `${baseName}${index}`;
};

export const getDefaultOntologyFieldInputForCategory = (
  category: OntologyFieldCategory = 'attribute'
): DefaultOntologyFieldCategoryInput => {
  if (category === 'behavior') {
    return {
      category,
      dataType: 'function',
      namePrefix: 'method',
    };
  }

  if (category === 'rule') {
    return {
      category,
      dataType: 'text',
      namePrefix: 'rule',
    };
  }

  if (category === 'constraint') {
    return {
      category,
      dataType: 'text',
      namePrefix: 'constraint',
    };
  }

  if (category === 'interface') {
    return {
      category,
      dataType: 'string',
      namePrefix: 'interface',
    };
  }

  return {
    category: 'attribute',
    dataType: 'string',
    namePrefix: 'attribute',
  };
};

export const createDefaultOntologyField = (
  input: CreateDefaultOntologyFieldInput
): OntologyField => {
  const fieldName = createUniqueOntologyFieldName(
    input.existingFields,
    input.namePrefix
  );

  return {
    id: input.fieldId ?? `${input.nodeId}:field:${fieldName}`,
    name: fieldName,
    value: input.value,
    dataType: input.dataType ?? 'string',
    category: input.category ?? 'attribute',
  };
};

export const appendDefaultOntologyField = (
  node: OntologyNode,
  input: Omit<CreateDefaultOntologyFieldInput, 'nodeId' | 'existingFields'> = {}
): OntologyField[] => {
  return [
    ...node.fields,
    createDefaultOntologyField({
      ...input,
      nodeId: node.id,
      existingFields: node.fields,
    }),
  ];
};

export const updateOntologyField = (
  fields: OntologyField[],
  fieldId: string,
  patch: UpdateOntologyFieldPatch
): OntologyField[] => {
  let changed = false;

  const nextFields = fields.map((field) => {
    if (field.id !== fieldId) {
      return field;
    }

    const hasNamePatch = 'name' in patch;
    const hasValuePatch = 'value' in patch;
    const hasDataTypePatch = 'dataType' in patch;

    const nextName = hasNamePatch
      ? (patch.name ?? '').trim()
      : field.name;

    if (nextName.length === 0) {
      return field;
    }

    const nextField: OntologyField = {
      ...field,
      name: nextName,
      value: hasValuePatch
        ? normalizeOptionalText(patch.value)
        : field.value,
      dataType: hasDataTypePatch
        ? normalizeOptionalText(patch.dataType)
        : field.dataType,
      category: patch.category ?? field.category,
    };

    changed = changed ||
      nextField.name !== field.name ||
      nextField.value !== field.value ||
      nextField.dataType !== field.dataType ||
      nextField.category !== field.category;

    return nextField;
  });

  return changed ? nextFields : fields;
};

export const deleteOntologyField = (
  fields: OntologyField[],
  fieldId: string
): OntologyField[] => {
  const nextFields = fields.filter(field => field.id !== fieldId);
  return nextFields.length === fields.length ? fields : nextFields;
};

export const moveOntologyField = (
  fields: OntologyField[],
  fieldId: string,
  direction: MoveOntologyFieldDirection,
  orderedFieldIds?: readonly string[]
): OntologyField[] => {
  const currentIndex = fields.findIndex(field => field.id === fieldId);
  if (currentIndex < 0) {
    return fields;
  }

  const scopedFieldIds = orderedFieldIds?.filter(id =>
    fields.some(field => field.id === id)
  );
  const scopedIndex = scopedFieldIds?.indexOf(fieldId) ?? -1;
  const targetFieldId = scopedIndex >= 0
    ? scopedFieldIds?.[direction === 'up' ? scopedIndex - 1 : scopedIndex + 1]
    : undefined;
  const targetIndex = targetFieldId
    ? fields.findIndex(field => field.id === targetFieldId)
    : currentIndex + (direction === 'up' ? -1 : 1);

  if (targetIndex < 0 || targetIndex >= fields.length || targetIndex === currentIndex) {
    return fields;
  }

  const nextFields = [...fields];
  [nextFields[currentIndex], nextFields[targetIndex]] = [
    nextFields[targetIndex],
    nextFields[currentIndex],
  ];

  return nextFields;
};
