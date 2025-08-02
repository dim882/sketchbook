# Sketchbook

A collection of creative coding sketches and tools.

## Development

### Available Commands

- `pnpm dev`: Starts the development server with hot reloading, file watching, and UI building
- `pnpm clone <base sketch name> <my sketch name>`: Creates a new sketch from a template
- `pnpm lib:pull`: Updates the shared library code
- `pnpm build`: Builds all sketches and the UI bundle
- `pnpm check`: Runs TypeScript type checking on sketch files

## Parameter Editing

Sketches can include editable parameters that persist between sessions. To add parameter editing to a sketch:

1. Create the actual params file `src/<sketch>.params.ts` with default values
2. Create a template file `src/<sketch>.params.tpl` with placeholder values like `{{paramName}}` - this template is used to regenerate the actual params file when values are saved
3. Add a server handler `src/<sketch>.server.ts` with a `getParams()` function to parse the params file
4. Include a parameter UI form in your sketch's HTML file with form fields that match your parameter names and a submit button
5. Initialize parameter handling in your sketch's JavaScript - the code must load current parameters on startup and handle form submission to save new values via the API endpoints

For a full example, see the `boids` sketch

The server will automatically handle loading and saving parameters via `/api/sketches/<sketch>/params` endpoints.

