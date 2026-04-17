/**
 * Reference implementation that emits placeholder code artifacts 1:1 from scaffold.
 * @param {{ files: string[] }} scaffold
 */
export function generateCode(scaffold) {
  return scaffold.files.map((file) => ({
    path: file,
    content: file.endsWith('/')
      ? null
      : `// BuildOrbitly generated artifact for ${file}\n// Implemented within schema constraints only.\n`
  }));
}
