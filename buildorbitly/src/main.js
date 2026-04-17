import { runPipeline } from './pipeline.js';
import { ACL } from './services/acl.js';

const acl = new ACL();

const sampleInput =
  'Create a marketing landing page with a hero section, features, and CTA form. Keep it lightweight.';

const result = runPipeline(sampleInput);

acl.record({
  misclassified: false,
  overscoped: false,
  schemaViolationCount: result.verification.errors.length
});

console.log('=== BuildOrbitly v1 Run ===');
console.log(JSON.stringify(result, null, 2));
console.log('=== ACL Metrics ===');
console.log(JSON.stringify(acl.snapshot(), null, 2));
