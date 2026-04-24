import { schemaRegistry } from './schema-registry.js';
import { compileIntent } from './services/intent-gate.js';
import { instantiateSchema } from './services/schema-instantiator.js';
import { createPlan } from './services/planner.js';
import { generateScaffold } from './services/scaffold-generator.js';
import { generateCode } from './services/code-generator.js';
import { verify } from './services/verify.js';

/**
 * Full deterministic BuildOrbitly pipeline:
 * Intent -> Schema -> Plan -> Scaffold -> Code -> Verify
 * @param {string} userInput
 */
export function runPipeline(userInput) {
  const intent = compileIntent(userInput);
  const scopedSchema = instantiateSchema(intent, schemaRegistry);
  const plan = createPlan(scopedSchema);
  const scaffold = generateScaffold(scopedSchema);
  const artifacts = generateCode(scaffold);
  const verification = verify(scopedSchema, scaffold);

  return {
    intent,
    scopedSchema,
    plan,
    scaffold,
    artifacts,
    verification
  };
}
