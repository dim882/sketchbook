declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module 'css-modules-require-hook' {
  function hook(options?: {
    generateScopedName?: string | ((name: string, filename: string, css: string) => string);
    extensions?: string[];
    [key: string]: any;
  }): void;
  export = hook;
}
