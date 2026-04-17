/**
 * Simple in-memory ACL telemetry collector.
 */
export class ACL {
  constructor() {
    this.metrics = {
      runs: 0,
      misclassification: 0,
      overscoping: 0,
      schemaViolations: 0
    };
  }

  /** @param {{ misclassified?: boolean; overscoped?: boolean; schemaViolationCount?: number }} event */
  record(event) {
    this.metrics.runs += 1;
    if (event.misclassified) this.metrics.misclassification += 1;
    if (event.overscoped) this.metrics.overscoping += 1;
    if ((event.schemaViolationCount || 0) > 0) this.metrics.schemaViolations += event.schemaViolationCount || 0;
  }

  snapshot() {
    return { ...this.metrics };
  }
}
