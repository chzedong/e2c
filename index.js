#! /usr/bin/env node

const { program } = require('commander');
const pkg = require('./package.json');
const cheerio = require('cheerio');
const chalk = require('chalk');
const axios = require('axios');

program
  .name('e2c')
  .description('中英文互译')
  .version(pkg.version || '0.1.0')
  .option('-e --english <english>', '需要翻译的英文')
  .option('-c --chinese <chinese>', '需要翻译的中文')
  .argument('[param]', '需要翻译的中文或者英文')
  .action(async function (param, options) {
    if (typeof param === 'string') {
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

async function handleEnglish(english) {
  const ora = (await import('ora')).default;
  const spinner = ora('Loading...').start();

  axios(`http://dict.cn/${encodeURI(english)}`)
    .then((res) => {
      let html = res.data || '';
      let $ = cheerio.load(html, {
        decodeEntities: false,
      });
      let chinese = $('.clearfix ul li')
        .text()
        .replace(/[\n\t]/g, '')
        .trim();
      if (!chinese) {
        spinner.fail('抱歉，未找到要查询的单词翻译');
      } else {
        spinner.succeed('done');
        console.log('中文翻译：' + chalk.green(chinese));
      }
    })
    .catch((er) => {
      spinner.fail('抱歉，未找到要查询的单词翻译');
    });
}

async function handleChinese(chinese) {
  const ora = (await import('ora')).default;
  const spinner = ora('Loading...').start();

  axios(`http://dict.cn/${encodeURI(chinese)}`)
    .then((res) => {
      let html = res.data || '';
      let $ = cheerio.load(html, {
        decodeEntities: false,
      });
      let englishs = [];
      $('.cn ul')
        .children()
        .each((i, ele) => {
          englishs.push(
            $(ele)
              .text()
              .replace(/[\n\t]/g, '')
              .trim()
          );
        });
      if (!englishs.length) {
        spinner.fail('抱歉，未找到要查询的单词翻译');
      } else {
        spinner.succeed('done');
        console.log('英文翻译：\n' + chalk.green(englishs.join('\n')));
      }
    })
    .catch((er) => {
      spinner.fail('抱歉，未找到要查询的单词翻译');
    });
}
