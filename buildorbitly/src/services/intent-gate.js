/**
 * Deterministically compile free-form request text into an IntentContract.
 * @param {string} userInput
 * @returns {import('../types.js').IntentContract}
 */
export function compileIntent(userInput) {
  const normalized = userInput.toLowerCase();

  const fullProductSignals = ['postgres', 'database', 'auth', 'backend', 'full product'];
  const lightAppSignals = ['api', 'light app', 'form submit', 'server'];

  const includesAny = (signals) => signals.some((s) => normalized.includes(s));

  let task_type = 'static_surface';
  if (includesAny(fullProductSignals)) {
    task_type = 'full_product';
  } else if (includesAny(lightAppSignals)) {
    task_type = 'light_app';
  }

  return {
    task_type,
    constraints: {
      frontend: true,
      server: task_type !== 'static_surface',
      db: task_type === 'full_product' ? true : 'maybe',
      auth: task_type === 'full_product',
      api: task_type !== 'static_surface'
    },
    expansion_lock: true,
    complexity_budget: task_type === 'full_product' ? 'high' : task_type === 'light_app' ? 'medium' : 'low'
  };
}
