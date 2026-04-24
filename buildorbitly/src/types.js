/** @typedef {'static_surface' | 'light_app' | 'full_product'} TaskType */
/** @typedef {'low' | 'medium' | 'high'} ComplexityBudget */

/**
 * @typedef {Object} ConstraintSet
 * @property {boolean} frontend
 * @property {boolean} server
 * @property {boolean | 'maybe'} db
 * @property {boolean} auth
 * @property {boolean} api
 */

/**
 * @typedef {Object} IntentContract
 * @property {TaskType} task_type
 * @property {ConstraintSet} constraints
 * @property {true} expansion_lock
 * @property {ComplexityBudget} complexity_budget
 */

/**
 * @typedef {Object} SchemaDefinition
 * @property {string} entry
 * @property {string[]} files
 * @property {boolean} server
 * @property {string[]} techStack
 */

/**
 * @typedef {Object<string, SchemaDefinition>} SchemaRegistry
 */
