// useEthereumProxy.ts - custom hook
import { useCallback } from 'react';

// 以太坊请求参数接口
export interface EthereumRequestArguments {
  method: string;       // 要调用的RPC方法名
  params?: unknown[] | object;  // 方法参数
}

// 以太坊响应接口
export interface EthereumResponse {
  id: string;           // 请求ID
  type: 'ethereum_response';  // 响应类型标识
  error?: string;       // 错误信息(如果有)
  result?: unknown;     // 响应结果
}

// 以太坊请求消息接口
export interface EthereumRequestMessage {
  type: 'ethereum_request';  // 请求类型标识
  id: string;           // 请求ID
  args: EthereumRequestArguments;  // 请求参数
}

const useEthereumProxy = () => {
  // 使用useCallback缓存request函数
  const request = useCallback(async (args: EthereumRequestArguments): Promise<unknown> => {
    return new Promise((resolve, reject) => {

      // 生成唯一的消息ID
      const messageId = Date.now().toString() + Math.random().toString();

      console.log('通过iframe发送以太坊请求:', args);

      // 构造请求消息
      const requestMessage: EthereumRequestMessage = {
        type: 'ethereum_request',
        id: messageId,
        args
      };

      // 发送到父窗口(兼容性处理)
      window.parent.postMessage(requestMessage, '*');

      // 处理响应消息
      const handleMessage = (event: MessageEvent) => {

        // 检查是否是匹配的响应
        if (event.data && event.data.type === 'ethereum_response' && event.data.id === messageId) {
          window.removeEventListener('message', handleMessage);
          if (event.data.error) {
            reject(new Error(event.data.error));
          } else {
            resolve(event.data.result);
          }
        }
      };

      window.addEventListener('message', handleMessage);


      // 清理回退超时
      const cleanupFallback = () => {
        // clearTimeout(fallbackTimeout);
        window.removeEventListener('message', cleanupFallback);
      };
      window.addEventListener('message', cleanupFallback);
    });
  }, []);

  // 返回模拟的ethereum对象
  return { ethereum: { request } };
};

export default useEthereumProxy;
