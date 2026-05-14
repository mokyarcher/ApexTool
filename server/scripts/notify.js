#!/usr/bin/env node
/**
 * 通知脚本 - 支持多种通知方式
 * 支持：邮件、Webhook、日志文件
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 动态导入 nodemailer（可选依赖）
let nodemailer = null;
try {
  nodemailer = await import('nodemailer');
  nodemailer = nodemailer.default || nodemailer;
} catch {
  // nodemailer 未安装，邮件功能将不可用
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置文件路径
const CONFIG_FILE = path.join(__dirname, '../../config/notify.json');

// 默认配置
const DEFAULT_CONFIG = {
  // 邮件配置 (支持 Gmail、QQ邮箱、163邮箱等)
  email: {
    enabled: false,
    smtp: {
      host: 'smtp.gmail.com',  // 或 smtp.qq.com、smtp.163.com
      port: 587,
      secure: false,
      auth: {
        user: '',  // 邮箱地址
        pass: '',  // 邮箱密码或授权码
      },
    },
    from: '',  // 发件人
    to: [],    // 收件人列表 ['email1@example.com', 'email2@example.com']
  },
  // Webhook 配置 (支持钉钉、企业微信、Discord 等)
  webhook: {
    enabled: false,
    url: '',   // Webhook URL
    type: 'discord',  // discord, dingtalk, wechat
  },
  // 日志文件配置
  logfile: {
    enabled: true,
    path: path.join(__dirname, '../../logs/notifications.log'),
  },
};

// 加载配置
function loadConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const userConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      return { ...DEFAULT_CONFIG, ...userConfig };
    } catch (e) {
      console.error('配置加载失败，使用默认配置:', e.message);
    }
  }
  return DEFAULT_CONFIG;
}

// 保存默认配置模板
function saveDefaultConfig() {
  const dir = path.dirname(CONFIG_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
    console.log(`配置文件已创建: ${CONFIG_FILE}`);
    console.log('请编辑配置文件，填写你的邮件或Webhook信息');
  }
}

// 发送邮件
async function sendEmail(config, subject, message) {
  if (!config.email.enabled || !nodemailer) {
    if (!nodemailer) {
      console.log('⚠️  邮件功能不可用，请安装 nodemailer: npm install nodemailer');
    }
    return;
  }

  const transporter = nodemailer.createTransport(config.email.smtp);

  const mailOptions = {
    from: config.email.from || config.email.smtp.auth.user,
    to: config.email.to.join(', '),
    subject,
    text: message,
    html: `<pre>${message}</pre>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ 邮件发送成功:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ 邮件发送失败:', error.message);
    return false;
  }
}

// 发送 Webhook
async function sendWebhook(config, title, message) {
  if (!config.webhook.enabled || !config.webhook.url) return;

  let payload;

  switch (config.webhook.type) {
    case 'discord':
      payload = {
        embeds: [{
          title,
          description: message,
          color: 0xff0000,
          timestamp: new Date().toISOString(),
        }],
      };
      break;
    case 'dingtalk':
      payload = {
        msgtype: 'markdown',
        markdown: {
          title,
          text: `## ${title}\n${message}`,
        },
      };
      break;
    case 'wechat':
      // 企业微信格式
      payload = {
        msgtype: 'markdown',
        markdown: {
          content: `**${title}**\n>${message.replace(/\n/g, '\n>')}`,
        },
      };
      break;
    default:
      payload = { title, message };
  }

  try {
    const response = await fetch(config.webhook.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log('✅ Webhook 发送成功');
      return true;
    } else {
      console.error('❌ Webhook 发送失败:', response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Webhook 发送失败:', error.message);
    return false;
  }
}

// 写入日志文件
function writeLog(config, title, message) {
  if (!config.logfile.enabled) return;

  const logDir = path.dirname(config.logfile.path);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${title}\n${message}\n${'='.repeat(50)}\n`;

  fs.appendFileSync(config.logfile.path, logEntry);
  console.log('✅ 已记录到日志:', config.logfile.path);
}

// 主函数
async function notify(title, message) {
  const config = loadConfig();

  console.log(`\n📢 发送通知: ${title}\n`);

  // 并行发送所有通知
  await Promise.all([
    sendEmail(config, title, message),
    sendWebhook(config, title, message),
    writeLog(config, title, message),
  ]);
}

// 命令行使用
if (process.argv.length >= 4) {
  const title = process.argv[2];
  const message = process.argv[3];
  notify(title, message);
} else if (process.argv[2] === '--init') {
  saveDefaultConfig();
} else if (process.argv[2] === '--test') {
  notify('测试通知', '这是一条测试消息\n时间: ' + new Date().toLocaleString());
} else {
  console.log(`
使用方法:
  node notify.js "标题" "消息内容"    发送通知
  node notify.js --init              创建配置文件模板
  node notify.js --test              发送测试通知

配置文件位置: ${CONFIG_FILE}
`);
}

export { notify };
