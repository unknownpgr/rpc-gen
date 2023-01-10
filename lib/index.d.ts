export interface RpcContext {
}
export interface RpcGenConfig {
    rpcApiUrl: string;
    frontendFile: string;
    backendFile: string;
}
export declare function generate(config?: RpcGenConfig): void;
export declare function cli(): void;
