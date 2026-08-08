declare module 'https://*' {
  const content: any;
  export default content;
  export const createClient: any;
}

declare module 'jsr:*' {
  const content: any;
  export default content;
  export const createClient: any;
}

declare module 'npm:*' {
  const content: any;
  export default content;
}

declare namespace ExcelJS {
  type Worksheet = any;
  type Workbook = any;
}

declare namespace Deno {
  export const env: {
    get(key: string): string | undefined;
  };
  export function serve(handler: (req: Request) => Promise<Response> | Response): void;
}
