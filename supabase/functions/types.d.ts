declare module 'https://deno.land/std@0.168.0/http/server.ts' {
  export function serve(handler: (req: Request) => Promise<Response> | Response): void;
}

declare namespace Deno {
  export const env: {
    get(key: string): string | undefined;
  };
}
