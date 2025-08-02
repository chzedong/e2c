#! /usr/bin/env node

import { program } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { translateWithDict } from './translate/dict.js';
import { fetchTranslateRegion } from './translate/translate.js';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取package.json
const pkg = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));

const handleChinese = async (text) => {
  const spinner = ora(chalk.blue('正在翻译中文...')).start();
  
  try {
    // 优先使用 dict.js 服务
    try {
      const result = await translateWithDict(text, 'en');
      spinner.succeed(chalk.green('翻译完成'));
      console.log(chalk.yellow('中文原文：') + chalk.white(text));
      console.log(chalk.yellow('英文翻译：') + chalk.green(result));
      return;
    } catch (primaryError) {
      spinner.text = chalk.yellow('主翻译服务失败，尝试备用服务...');
      
      // 备用服务：使用 translate.js
      try {
        const result = await fetchTranslateRegion(text, { from: 'zh-CHS', to: 'en' });
        spinner.succeed(chalk.green('翻译完成（备用服务）'));
        console.log(chalk.yellow('中文原文：') + chalk.white(text));
        console.log(chalk.yellow('英文翻译：') + chalk.green(result));
        return;
      } catch (secondaryError) {
        throw new Error(`所有翻译服务均失败: ${primaryError.message}; ${secondaryError.message}`);
      }
    }
  } catch (error) {
    spinner.fail(chalk.red('翻译失败'));
    console.error(chalk.red('错误详情：') + error.message);
  }
};

const handleEnglish = async (text) => {
  const spinner = ora(chalk.blue('正在翻译英文...')).start();
  
  try {
    // 优先使用 dict.js 服务
    try {
      const { translateWithDict } = await import('./translate/dict.js');
      const result = await translateWithDict(text, 'zh');
      spinner.succeed(chalk.green('翻译完成'));
      console.log(chalk.yellow('英文原文：') + chalk.white(text));
      console.log(chalk.yellow('中文翻译：') + chalk.green(result));
      return;
    } catch (primaryError) {
      spinner.text = chalk.yellow('主翻译服务失败，尝试备用服务...');
      
      // 备用服务：使用 translate.js
      try {
        const { fetchTranslateRegion } = await import('./translate/translate.js');
        const result = await fetchTranslateRegion(text, { from: 'en', to: 'zh-CHS' });
        spinner.succeed(chalk.green('翻译完成（备用服务）'));
        console.log(chalk.yellow('英文原文：') + chalk.white(text));
        console.log(chalk.yellow('中文翻译：') + chalk.green(result));
        return;
      } catch (secondaryError) {
        throw new Error(`所有翻译服务均失败: ${primaryError.message}; ${secondaryError.message}`);
      }
    }
  } catch (error) {
    spinner.fail(chalk.red('翻译失败'));
    console.error(chalk.red('错误详情：') + error.message);
  }
};

program
  .name('e2c')
  .description('中英文互译')
  .version(pkg.version || '0.1.0')
  .option('-e --english <english>', '需要翻译的英文')
  .option('-c --chinese <chinese>', '需要翻译的中文')
  .argument('[param]', '需要翻译的中文或者英文')
  .action(async function (param, options) {
    if (typeof param === 'string') {
      // 降级到传统检测方式
      if (/[\u4e00-\u9fa5]/.test(param)) {
        return await handleChinese(param);
      } else {
        return await handleEnglish(param);
      }
    }

    if (!options.english && !options.chinese) {
      console.error(
        '请输入需要翻译的内容，参数：-e --english <english>；-c --chinese <chinese>；[param]'
      );
      return;
    }

    if (options.english) {
      return await handleEnglish(options.english);
    }

    if (options.chinese) {
      return await handleChinese(options.chinese);
    }
  });

program.parse(process.argv);
