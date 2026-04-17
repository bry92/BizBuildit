/**
 * @param {{ files: string[] }} scopedSchema
 */
export function generateScaffold(scopedSchema) {
  return {
    root: 'project/',
    files: [...scopedSchema.files]
  };
}
