/** @type {import('./types.js').SchemaRegistry} */
export const schemaRegistry = {
  static_surface: {
    entry: 'index.html',
    files: ['index.html', 'styles.css', 'script.js'],
    server: false,
    techStack: ['html', 'css', 'js']
  },
  light_app: {
    entry: 'index.html',
    files: ['frontend/', 'api/minimal.js'],
    server: true,
    techStack: ['frontend', 'node']
  },
  full_product: {
    entry: 'server.js',
    files: ['frontend/', 'backend/', 'db/'],
    server: true,
    techStack: ['node', 'postgres', 'auth', 'api']
  }
};
