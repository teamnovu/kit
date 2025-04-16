declare module "*.module.scss";

declare module 'process' {
  global {
    namespace NodeJS {
      interface Process {
        client: boolean;
        server: boolean;
      }
    }
  }
}
