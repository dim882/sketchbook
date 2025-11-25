// Initialize CSS modules hook for server-side rendering
// This must be imported before any CSS modules are imported
import hook from 'css-modules-require-hook';

hook({
  generateScopedName: '[name]__[local]___[hash:base64:5]',
  extensions: ['.css', '.module.css'],
});
