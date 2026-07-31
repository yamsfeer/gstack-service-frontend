import { describe, it, expect, vi } from 'vitest';
import { wait } from '../helpers';

// 独立文件：downloadFileWithAuth 直接调用 axios 默认导出，需整体 mock axios
const { axiosMock } = vi.hoisted(() => ({
  axiosMock: vi.fn(),
}));
vi.mock('axios', () => ({ default: axiosMock }));
vi.mock('@/router', () => ({
  default: { app: { $store: { getters: { GET_TOKEN: 'mock-token' } } } },
}));

describe('utils/downloadFileWithAuth.js', () => {
  it('携带 token 下载文件并触发点击', async () => {
    axiosMock.mockResolvedValue({ data: new ArrayBuffer(8) });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'dispatchEvent').mockImplementation(() => true);
    const { downloadFileWithAuth } = await import('@/utils/downloadFileWithAuth');
    downloadFileWithAuth('http://localhost:8000/test.bin', 'test.bin');
    await wait(50);
    expect(axiosMock).toHaveBeenCalledWith(expect.objectContaining({
      headers: { Authorization: 'Bearer mock-token' },
      method: 'get',
      url: 'http://localhost:8000/test.bin',
      responseType: 'arraybuffer',
    }));
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it('下载失败静默处理', async () => {
    axiosMock.mockRejectedValue(new Error('fail'));
    const { downloadFileWithAuth } = await import('@/utils/downloadFileWithAuth');
    downloadFileWithAuth('http://localhost:8000/test.bin', 'test.bin');
    await wait(50);
    expect(axiosMock).toHaveBeenCalled();
  });
});
