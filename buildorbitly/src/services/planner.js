/**
 * Generates a constrained plan. It cannot add layers absent from the schema.
 * @param {{ taskType: string; files: string[]; }} scopedSchema
 */
export function createPlan(scopedSchema) {
  const plan = [];

  if (scopedSchema.files.some((file) => file.includes('index.html') || file.startsWith('frontend/'))) {
    plan.push('Build frontend structure');
    plan.push('Implement styling and interaction behavior');
  }

  if (scopedSchema.files.some((file) => file.startsWith('api/') || file.startsWith('backend/'))) {
    plan.push('Implement server routes inside allowed backend scope');
  }

  if (scopedSchema.files.some((file) => file.startsWith('db/'))) {
    plan.push('Define persistence layer contracts in db scope');
  }

  return plan;
}
