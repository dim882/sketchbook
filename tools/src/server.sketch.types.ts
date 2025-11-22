export interface SketchServerHandler {
  getParams(fileContent: string): Record<string, unknown>;
}
