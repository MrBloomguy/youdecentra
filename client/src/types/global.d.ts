// Global type declarations for browser environment
declare interface Window {
  global: Window;
  Buffer: typeof Buffer;
}

// For modules that don't have type definitions
declare module '@orbisclub/orbis-sdk' {
  export default class Orbis {
    constructor(options?: any);
    connect_v2(options: any): Promise<any>;
    logout(): Promise<any>;
    createPost(options: any): Promise<any>;
    getPosts(options: any, page?: number): Promise<any>;
    getProfile(did: string): Promise<any>;
    createContext(options: any): Promise<any>;
    react(postId: string, type: string): Promise<any>;
    getReaction(postId: string, did: string): Promise<any>;
  }
}