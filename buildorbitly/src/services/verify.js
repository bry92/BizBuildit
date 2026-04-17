/**
 * Hard-gate verification for schema compliance.
 * @param {{ entry: string; files: string[]; taskType: string }} scopedSchema
 * @param {{ files: string[] }} scaffold
 */
export function verify(scopedSchema, scaffold) {
  const errors = [];

  const expected = new Set(scopedSchema.files);
  const actual = new Set(scaffold.files);

  for (const file of actual) {
    if (!expected.has(file)) {
      errors.push(`Forbidden file or layer: ${file}`);
    }
  }

  for (const file of expected) {
    if (!actual.has(file)) {
      errors.push(`Missing required file: ${file}`);
    }
  }

  const containsEntry = scaffold.files.some((file) => file === scopedSchema.entry || file === `${scopedSchema.entry}/`);
  if (!containsEntry && !scopedSchema.entry.includes('/')) {
    errors.push(`Missing required entry point: ${scopedSchema.entry}`);
  }

  if (scopedSchema.taskType === 'static_surface' && scaffold.files.some((f) => f.startsWith('api/') || f.startsWith('backend/') || f.startsWith('db/'))) {
    errors.push('Constraint violation: backend layers are not allowed in static_surface schema');
  }

  return {
    ok: errors.length === 0,
    errors
  };
}
