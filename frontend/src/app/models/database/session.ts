export interface Session {
  ok: boolean;
  userCtx?: UserCtx;
  info?: Info;
}

export interface UserCtx {
  name?: any;
  roles?: any[];
}
export interface Info {
  authenticated?: string
  authentication_handlers: string[];
}

