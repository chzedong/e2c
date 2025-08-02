import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const cheerio = require('cheerio');

/**
 * Dict.cn 翻译服务配置
 */
const DICT_CONFIG = {
  BASE_URL: 'http://dict.cn',
  TIMEOUT: 10000, // 8秒超时
  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

/**
 * 使用 dict.cn 进行翻译
 * @param {string} text - 要翻译的文本
 * @param {string} to - en 英文 zh 中文
 * @returns {Promise<string>} 翻译结果
 */
export const translateWithDict = async (text, to) => {
  if (!text || typeof text !== 'string') {
    throw new Error('翻译文本不能为空且必须是字符串');
  }

  // 创建 AbortController 用于超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DICT_CONFIG.TIMEOUT);

  try {
    const url = `${DICT_CONFIG.BASE_URL}/${encodeURI(text)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': DICT_CONFIG.USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Dict.cn 请求失败: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html, {
      decodeEntities: false,
    });

    let result = '';
    
    if (to === 'en') {
      // 中文翻译成英文
      const englishResults = [];
      $('.cn ul')
        .children()
        .each((i, ele) => {
          const translation = $(ele)
            .text()
            .replace(/[\n\t]/g, '')
            .trim();
          if (translation) {
            englishResults.push(translation);
          }
        });
      
      if (englishResults.length > 0) {
        result = englishResults.join('\n');
      }
    } else {
      // 英文翻译成中文
      result = $('.clearfix ul li')
        .text()
        .replace(/[\n\t]/g, '')
        .trim();
    }

    if (!result) {
      throw new Error('未找到翻译结果');
    }

    return result;

  } catch (error) {
    clearTimeout(timeoutId);
    
    
    // 处理不同类型的错误
    if (error.name === 'AbortError') {
      throw new Error(`Dict.cn 翻译请求超时（${DICT_CONFIG.TIMEOUT / 1000}秒）`);
    }
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('网络连接失败，请检查网络设置');
    }
    
    throw error;
  }
};
