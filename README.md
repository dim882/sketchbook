# Sketchbook

A collection of creative coding sketches and tools.

## Development

### Tools Commands

- `dev`: Starts the development server with hot reloading
- `watch`: Watches for changes in sketch files and rebuilds as needed
- `clone`: Creates a new sketch from a template: `pnpm clone <base sketch name> <my sketch name>`
- `build`: Builds the UI bundle once
- `build:watch`: Builds the UI bundle and watches for changes
- `build:all`: Builds all sketches and the UI bundle
- `lib:pull`: Updates the shared library code

## Parameter Editing

Sketches can include editable parameters that persist between sessions. To add parameter editing to a sketch:

1. Create the actual params file `src/<sketch>.params.ts` with default values
2. Create a template file `src/<sketch>.params.tpl` with placeholder values like `{{paramName}}` - this template is used to regenerate the actual params file when values are saved
3. Add a server handler `src/<sketch>.server.ts` with a `getParams()` function to parse the params file
4. Include a parameter UI form in your sketch's HTML file with form fields that match your parameter names and a submit button
5. Initialize parameter handling in your sketch's JavaScript - the code must load current parameters on startup and handle form submission to save new values via the API endpoints

For a full example, see the `boids` sketch

The server will automatically handle loading and saving parameters via `/api/sketches/<sketch>/params` endpoints.

