// 配置常量
const TRANSLATE_CONFIG = {
  API_URL: 'https://api.cognitive.microsofttranslator.com/translate',
  API_VERSION: '3.0',
  DEFAULT_FROM: 'zh-CHS',
  DEFAULT_TO: 'zh-CHT',
  TIMEOUT: 10000, // 10秒超时
};


// 从环境变量或配置文件获取token（生产环境中不应硬编码）
const getAuthToken = () => {
  // 注意：实际使用时应该从环境变量或安全配置中获取
  return process.env.TRANSLATOR_TOKEN || 
    'Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6ImtleTEiLCJ0eXAiOiJKV1QifQ.eyJyZWdpb24iOiJnbG9iYWwiLCJzdWJzY3JpcHRpb24taWQiOiI2ZjY1YjliY2JkNjA0ZDg4ODhiZWI2M2I4MTM4ODZlZSIsInByb2R1Y3QtaWQiOiJUZXh0VHJhbnNsYXRvci5TMyIsImNvZ25pdGl2ZS1zZXJ2aWNlcy1lbmRwb2ludCI6Imh0dHBzOi8vYXBpLmNvZ25pdGl2ZS5taWNyb3NvZnQuY29tL2ludGVybmFsL3YxLjAvIiwiYXp1cmUtcmVzb3VyY2UtaWQiOiIvc3Vic2NyaXB0aW9ucy84MWZjMTU3Yi0zMDdlLTRjMjEtOWY3MS0zM2QxMDMwNGRmMzMvcmVzb3VyY2VHcm91cHMvRWRnZV9UcmFuc2xhdGVfUkcvcHJvdmlkZXJzL01pY3Jvc29mdC5Db2duaXRpdmVTZXJ2aWNlcy9hY2NvdW50cy9UcmFuc2xhdGUiLCJzY29wZSI6Imh0dHBzOi8vYXBpLm1pY3Jvc29mdHRyYW5zbGF0b3IuY29tLyIsImF1ZCI6InVybjptcy5taWNyb3NvZnR0cmFuc2xhdG9yIiwiZXhwIjoxNzU0MTI0Mjg3LCJpc3MiOiJ1cm46bXMuY29nbml0aXZlc2VydmljZXMifQ.Ka7se--9vM7ooneEZEIKz1r2cPcfnk-b7GmEZXIA9ia9xTJT3xriNaTUC60D9thsBtAEGZhIck4o6XAsiYcOXQ';
};

/**
 * 翻译文本（简体中文转繁体中文）
 * @param {string} word - 要翻译的文本
 * @param {Object} options - 翻译选项
 * @param {string} options.from - 源语言，默认为 'zh-CHS'
 * @param {string} options.to - 目标语言，默认为 'zh-CHT'
 * @returns {Promise<string>} 翻译结果
 * @throws {Error} 翻译失败时抛出错误
 */
export const fetchTranslateRegion = async (word, options = {}) => {
  // 参数验证
  if (!word || typeof word !== 'string') {
    throw new Error('翻译文本不能为空且必须是字符串');
  }

  if (word.trim().length === 0) {
    throw new Error('翻译文本不能为空白字符');
  }

  const { from = TRANSLATE_CONFIG.DEFAULT_FROM, to = TRANSLATE_CONFIG.DEFAULT_TO } = options;
  
  // 构建URL
  const url = new URL(TRANSLATE_CONFIG.API_URL);
  url.searchParams.set('from', from);
  url.searchParams.set('to', to);
  url.searchParams.set('api-version', TRANSLATE_CONFIG.API_VERSION);
  url.searchParams.set('includeSentenceLength', 'true');

  // 创建AbortController用于超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TRANSLATE_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': getAuthToken(),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: JSON.stringify([{ Text: word.trim() }]),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 检查HTTP状态
    if (!response.ok) {
      throw new Error(`翻译API请求失败: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();

    // 验证响应数据结构
    if (!Array.isArray(json) || json.length === 0) {
      throw new Error('翻译API返回数据格式错误');
    }

    const firstResult = json[0];
    if (!firstResult || !Array.isArray(firstResult.translations) || firstResult.translations.length === 0) {
      throw new Error('翻译结果为空');
    }

    // 提取并返回翻译结果
    return firstResult.translations
      .map(item => item.text)
      .filter(text => text && text.trim()) // 过滤空结果
      .join('');

  } catch (error) {
    clearTimeout(timeoutId);
    
    // 处理不同类型的错误
    if (error.name === 'AbortError') {
      throw new Error(`翻译请求超时（${TRANSLATE_CONFIG.TIMEOUT / 1000}秒）`);
    }
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('网络连接失败，请检查网络设置');
    }
    
    // 重新抛出其他错误
    throw error;
  }
};
