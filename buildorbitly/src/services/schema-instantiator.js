/**
 * @param {import('../types.js').IntentContract} intent
 * @param {import('../types.js').SchemaRegistry} registry
 */
export function instantiateSchema(intent, registry) {
  const schema = registry[intent.task_type];
  if (!schema) {
    throw new Error(`No schema registered for task type: ${intent.task_type}`);
  }

  return {
    taskType: intent.task_type,
    entry: schema.entry,
    files: [...schema.files],
    server: schema.server,
    techStack: [...schema.techStack],
    expansion_lock: intent.expansion_lock
  };
}
