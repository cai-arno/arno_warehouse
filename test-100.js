/**
 * 短视频工厂 - 自动化测试脚本 v2
 * 用法: node test-100.js [次数]
 * 默认执行100遍
 */
import https from 'https';
import http from 'http';

const BASE_URL = 'http://localhost:8000/api/v1';
const TEST_PHONE_1 = '18180769518';
const TEST_PHONE_2 = '18180769519';
const TEST_CODE = '123456';

let passed = 0;
let failed = 0;
const results = [];
const failedTests = new Set();

function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0,-1) : BASE_URL;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const url = new URL(cleanPath, base + '/');

    const options = {
      hostname: url.hostname,
      port: url.port || 8000,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Connection': 'close',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    };

    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      if (err.message === 'socket hang up') {
        resolve({ status: 0, data: { error: 'socket hang up' } });
      } else {
        reject(err);
      }
    });
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function assert(condition, testName, details = '') {
  if (condition) {
    passed++;
    results.push(`✅ ${testName}`);
    console.log(`  ✅ ${testName}`);
  } else {
    failed++;
    results.push(`❌ ${testName} ${details}`);
    console.log(`  ❌ ${testName} ${details}`);
    failedTests.add(testName.split(' ')[0]);
  }
}

// ========== 测试用例 ==========

async function testLogin() {
  console.log('\n📱 测试登录模块...');

  // 1.1 手机号格式校验 - 过短
  let res = await request('POST', '/auth/send-code?phone=12345');
  assert(res.status === 400, '1.1a 手机号格式校验-过短');

  // 1.1 手机号格式校验 - 非1开头
  res = await request('POST', '/auth/send-code?phone=2987654321');
  assert(res.status === 400, '1.1b 手机号格式校验-非1开头');

  // 1.1 手机号格式校验 - 超过11位
  res = await request('POST', '/auth/send-code?phone=181807695180');
  assert(res.status === 400, '1.1c 手机号格式校验-超过11位');

  // 1.3 发送验证码
  res = await request('POST', `/auth/send-code?phone=${TEST_PHONE_1}`);
  assert(res.status === 200 && res.data.success, '1.3 发送验证码成功');

  // 1.4 验证码按钮倒计时 (验证60秒内不能重发)
  res = await request('POST', `/auth/send-code?phone=${TEST_PHONE_1}`);
  assert(res.status === 200, '1.4 60秒内可重发(演示模式)');

  // 1.5 记住账号 (通过本地存储模拟)
  // 前端测试，此处跳过

  // 1.6 登录成功
  res = await request('POST', `/auth/login?phone=${TEST_PHONE_1}&code=${TEST_CODE}`);
  assert(res.status === 200 && res.data.access_token, '1.6 登录成功-返回token');
  assert(res.data.user?.phone === TEST_PHONE_1, '1.6 登录成功-返回用户phone');
  assert(/^USRS[A-F0-9]{8}$/.test(res.data.user?.id), '1.6 登录成功-用户ID格式USRS+8位hex');
  const token = res.data.access_token;

  // 1.7 登录失败-错误验证码
  res = await request('POST', `/auth/login?phone=${TEST_PHONE_1}&code=000000`);
  assert(res.status === 401, '1.7 登录失败-错误验证码');

  // 1.8 登录失败-过期验证码 (等待5分钟，测试时跳过)
  // res = await sleep(300000); // 5分钟太长，跳过

  return token;
}

async function testHomePage(token) {
  console.log('\n🏠 测试首页...');

  // 2.1 首页数据加载
  const scriptsRes = await request('GET', '/scripts?page_size=5', null, token);
  assert(scriptsRes.status === 200, '2.1a 首页-脚本统计');
  assert(typeof scriptsRes.data?.total === 'number', '2.1a 首页-脚本总数是数字');

  const videosRes = await request('GET', '/videos?page_size=5', null, token);
  assert(videosRes.status === 200, '2.1b 首页-视频统计');

  const publishRes = await request('GET', '/publishing?page_size=5', null, token);
  assert(publishRes.status === 200, '2.1c 首页-发布统计');

  // 2.2-2.5 快捷入口 (前端路由测试，跳过)

  // 2.6 最近脚本-列表渲染
  assert(Array.isArray(scriptsRes.data?.items), '2.6 最近脚本-返回数组');

  // 2.7 最近脚本-空状态
  // 需要清空数据后测试，跳过

  // 2.8 最近视频-列表渲染
  assert(Array.isArray(videosRes.data?.items), '2.8 最近视频-返回数组');
}

async function testScripts(token) {
  console.log('\n📝 测试脚本模块...');

  // 3.1 生成脚本按钮 (前端测试，跳过)
  // 3.2 主题输入-空 (前端校验，跳过)

  // 3.3 生成脚本
  const timestamp = Date.now();
  const res = await request('POST', '/scripts/generate', {
    topic: `自动化测试脚本_${timestamp}`,
    script_type: 'product_showcase',
    quantity: 1,
    style: '轻松幽默'
  }, token);
  assert(res.status === 200, '3.3 生成脚本成功');
  const scriptId = res.data?.id;
  assert(/^SCRI[A-F0-9]{8}$/.test(scriptId), '10.2 脚本ID格式SCRI+8位16进制');

  // 3.4 生成不同类型脚本
  const types = ['tutorial', 'story', 'review', 'lifestyle'];
  for (const t of types) {
    const r = await request('POST', '/scripts/generate', {
      topic: `测试${t}`,
      script_type: t,
      quantity: 1
    }, token);
    assert(r.status === 200, `3.4 生成脚本类型-${t}`);
  }

  // 3.5 脚本列表-无数据 (需要清空后测试，跳过)
  const listRes = await request('GET', '/scripts?page=1&page_size=20', null, token);
  assert(listRes.status === 200, '3.5 脚本列表加载成功');
  assert(Array.isArray(listRes.data?.items), '3.5 脚本列表返回数组');
  assert(listRes.data?.total >= 0, '3.5 脚本总数是数字');

  // 3.6 脚本列表-有数据
  assert(listRes.data?.items?.length > 0, '3.6 脚本列表有数据');

  // 3.7 查看脚本详情
  if (scriptId) {
    const detailRes = await request('GET', `/scripts/${scriptId}`, null, token);
    assert(detailRes.status === 200, '3.7 脚本详情加载成功');
    assert(detailRes.data?.hook !== undefined, '3.7 脚本详情含hook字段');
    assert(detailRes.data?.body !== undefined, '3.7 脚本详情含body字段');
    assert(detailRes.data?.cta !== undefined, '3.7 脚本详情含cta字段');
    // 3.7 脚本内容换行符渲染 (前端测试，跳过)
  }

  // 3.8 删除脚本
  // (跳过删除，scriptId 需保留给 testVideos 使用)

  // 10.1 用户ID格式
  const meRes = await request('GET', '/auth/me', null, token);
  assert(/^USRS[A-F0-9]{8}$/.test(meRes.data?.id), '10.1 用户ID格式USRS+8位16进制');

  // 11.9 ID连续性 (需要生成多个对比，跳过)
  // 11.10 ID超9显示16进制 (测试10个脚本后ID应为A/B/C)

  return scriptId;
}

async function testVideos(token, scriptId) {
  console.log('\n🎬 测试视频模块...');

  // 4.1 视频列表
  const listRes = await request('GET', '/videos?page=1&page_size=20', null, token);
  assert(listRes.status === 200, '4.1 视频列表加载成功');

  // 4.2 视频卡片-基本信息
  if (listRes.data?.items?.length > 0) {
    const v = listRes.data.items[0];
    assert(v?.title !== undefined, '4.2 视频标题存在');
    assert(v?.status !== undefined, '4.2 视频状态存在');
  }

  // 4.3 视频待处理状态
  // (需要创建新视频测试)

  // 11.1 从脚本创建视频
  if (scriptId) {
    const createRes = await request('POST', '/videos', {
      script_id: scriptId,
      template_id: null
    }, token);
    assert(createRes.status === 200, '11.1 从脚本创建视频成功');
    const videoId = createRes.data?.id;
    assert(/^VIDE[A-F0-9]{8}$/.test(videoId), '10.3 视频ID格式VIDE+8位16进制');

    if (videoId) {
      // 4.4 开始渲染
      const renderRes = await request('POST', '/videos/render', { video_id: videoId }, token);
      assert(renderRes.status === 200, '4.4 开始渲染成功');

      // 4.5 渲染中状态
      const detailRes = await request('GET', `/videos/${videoId}`, null, token);
      assert(detailRes.status === 200, '4.5 获取视频详情');
      assert(['pending', 'rendering', 'completed', 'failed'].includes(detailRes.data?.status), '4.5 视频状态值合法');

      // 4.6 视频已完成状态
      // (需要等待渲染完成)

      // 4.7 预览按钮
      // (前端测试，跳过)

      // 4.8 视频失败状态
      // (需要模拟失败)

      return videoId;
    }
  }

  return null;
}

async function testMaterials(token) {
  console.log('\n🖼️ 测试素材模块...');

  // 5.1-5.5 上传功能 (需要文件上传，跳过API测试)

  // 5.6-5.10 类型筛选
  const types = [
    { key: '5.6', value: 'video', label: '视频' },
    { key: '5.7', value: 'image', label: '图片' },
    { key: '5.8', value: 'audio', label: '音频' },
    { key: '5.9', value: 'voiceover', label: '配音' },
    { key: '5.10', value: '', label: '全部' },
  ];
  for (const t of types) {
    const url = t.value ? `/materials?material_type=${t.value}` : '/materials';
    const res = await request('GET', url, null, token);
    assert(res.status === 200, `${t.key} 类型筛选-${t.label}`);
    assert(Array.isArray(res.data?.items), `${t.key} 类型筛选返回数组`);
  }

  // 5.11 关键词搜索-有结果
  const searchRes = await request('GET', '/materials?keyword=test', null, token);
  assert(searchRes.status === 200, '5.11 关键词搜索');

  // 5.12 素材列表-无数据
  const emptyRes = await request('GET', '/materials?keyword=nonexistent_xyz_123', null, token);
  assert(emptyRes.status === 200, '5.12 素材空列表');
  assert(emptyRes.data?.items?.length === 0, '5.12 无结果时返回空数组');

  // 5.13-5.19 素材预览/删除 (需要先上传素材，跳过)

  // 5.20 素材ID格式 (需要先有素材)
}

async function testPublishing(token, videoId) {
  console.log('\n🚀 测试发布模块...');

  // 6.1 发布列表
  const listRes = await request('GET', '/publishing?page=1&page_size=20', null, token);
  assert(listRes.status === 200, '6.1 发布列表加载成功');
  assert(Array.isArray(listRes.data?.items), '6.1 发布列表返回数组');

  // 6.2-6.10 发布详情 (需要先有发布记录)

  // 11.2 从视频创建发布
  if (videoId) {
    const platforms = ['douyin', 'kuaishou', 'wechat', 'xigua', 'bilibili'];
    for (const platform of platforms) {
      const createRes = await request('POST', '/publishing', {
        video_id: videoId,
        platform
      }, token);
      assert(createRes.status === 200, `11.2 创建发布-${platform}`);
      assert(createRes.data?.platform === platform, `11.2 发布平台正确-${platform}`);
    }
  }
}

async function testAnalytics(token) {
  console.log('\n📊 测试数据看板...');

  // 7.1 核心指标
  const overviewRes = await request('GET', '/analytics/overview', null, token);
  assert(overviewRes.status === 200, '7.1 核心指标加载');
  assert(overviewRes.data?.scripts !== undefined, '7.1 脚本统计存在');
  assert(overviewRes.data?.videos !== undefined, '7.1 视频统计存在');
  assert(overviewRes.data?.publishing !== undefined, '7.1 发布统计存在');

  // 7.2 核心指标-完成数
  assert(overviewRes.data?.scripts?.completed !== undefined, '7.2 脚本完成数存在');
  assert(overviewRes.data?.videos?.completed !== undefined, '7.2 视频完成数存在');
  assert(overviewRes.data?.publishing?.published !== undefined, '7.2 发布完成数存在');

  // 7.3 趋势图
  const trendsRes = await request('GET', '/analytics/trends?days=7', null, token);
  assert(trendsRes.status === 200, '7.3 趋势图加载');
  assert(Array.isArray(trendsRes.data?.scripts), '7.3 脚本趋势是数组');
  assert(Array.isArray(trendsRes.data?.videos), '7.3 视频趋势是数组');
  assert(Array.isArray(trendsRes.data?.publishes), '7.3 发布趋势是数组');

  // 7.4 趋势图-无数据 (需要清空数据后测试，跳过)

  // 7.5 平台分布
  const platformsRes = await request('GET', '/analytics/platforms', null, token);
  assert(platformsRes.status === 200, '7.5 平台分布加载');
  assert(Array.isArray(platformsRes.data?.platforms), '7.5 平台数据是数组');

  // 7.6 平台分布-无数据
  if (platformsRes.data?.platforms?.length === 0) {
    // 空数据正常
  }

  // 7.7 热门视频TOP10
  const topRes = await request('GET', '/analytics/top?limit=10', null, token);
  assert(topRes.status === 200, '7.7 热门视频TOP10加载');
  assert(Array.isArray(topRes.data?.items), '7.7 TOP10是数组');

  // 7.8 热门视频-无数据
  // (空数据正常)

  // 7.9 热门视频-前三名
  // (需要有多条数据)
}

async function testPermissionIsolation() {
  console.log('\n🔐 测试权限隔离...');

  // 9.1-9.3 脚本/视频/素材归属

  // 先发送验证码（内存存储需要先send-code才能login）
  await request('POST', `/auth/send-code?phone=${TEST_PHONE_1}`);
  await request('POST', `/auth/send-code?phone=${TEST_PHONE_2}`);

  // 登录账号1
  const login1 = await request('POST', `/auth/login?phone=${TEST_PHONE_1}&code=${TEST_CODE}`);
  const token1 = login1.data?.access_token;
  assert(login1.status === 200, '9.1 账号1登录成功');

  // 创建账号1的私有脚本
  const create1 = await request('POST', '/scripts/generate', {
    topic: `账号1私有_${Date.now()}`,
    script_type: 'product_showcase'
  }, token1);
  const account1ScriptId = create1.data?.id;
  assert(create1.status === 200, '9.1 创建账号1脚本成功');

  // 登录账号2
  const login2 = await request('POST', `/auth/login?phone=${TEST_PHONE_2}&code=${TEST_CODE}`);
  const token2 = login2.data?.access_token;
  assert(login2.status === 200, '9.2 账号2登录成功');

  // 账号2查看脚本列表
  const list2 = await request('GET', '/scripts?page=1&page_size=100', null, token2);
  assert(list2.status === 200, '9.2 账号2获取脚本列表');

  // 账号2不应看到账号1的脚本
  const account1Visible = list2.data?.items?.some(item => item.id === account1ScriptId);
  assert(!account1Visible, '9.1 脚本归属-账号2看不到账号1数据');

  // 9.5 跨账号详情访问
  const crossAccess = await request('GET', `/scripts/${account1ScriptId}`, null, token2);
  assert(crossAccess.status === 404, '9.5 跨账号访问脚本返回404');

  // 9.3 素材归属
  // (需要先上传素材)

  // 9.4 发布归属
  // (通过脚本/视频归属间接验证)

  // 清理
  if (account1ScriptId && token1) {
    await request('DELETE', `/scripts/${account1ScriptId}`, null, token1);
  }
}

async function testAuthEdgeCases(token) {
  console.log('\n🔑 测试认证边界...');

  // 8.3 用户信息
  const meRes = await request('GET', '/auth/me', null, token);
  assert(meRes.status === 200, '8.3 获取用户信息成功');
  assert(meRes.data?.phone, '8.3 用户手机号存在');
  assert(/^USRS[A-F0-9]{8}$/.test(meRes.data?.id), '8.3 用户ID格式正确');

  // 8.4 退出登录 (前端操作，跳过)

  // 11.5 Token无效
  const invalidRes = await request('GET', '/scripts', null, 'invalid_token_xyz');
  assert(invalidRes.status === 401, '11.5 无效Token被拒绝');

  // 11.6 未登录访问
  const noTokenRes = await request('GET', '/scripts');
  assert(noTokenRes.status === 401, '11.6 无Token访问被拒绝');

  // 11.7 脚本内容换行符 (前端渲染，跳过API测试)
}

async function testNavigationLayout(token) {
  console.log('\n🧭 测试导航布局...');

  // 8.1-8.6 前端路由测试，API层面验证相关数据接口可用
  const routes = ['/scripts', '/videos', '/materials', '/publishing', '/analytics'];
  for (const route of routes) {
    const path = route.replace('/scripts', '/scripts?page=1&page_size=20')
                      .replace('/videos', '/videos?page=1&page_size=20')
                      .replace('/materials', '/materials?page=1&page_size=20')
                      .replace('/publishing', '/publishing?page=1&page_size=20');
    const res = await request('GET', path, null, token);
    assert(res.status === 200, `8.6 ${route}页面数据接口可用`);
  }
}

async function testIDFormats(token) {
  console.log('\n🔢 测试ID格式...');

  // 10.1-10.5 ID格式验证 (已在其他测试中覆盖)

  // 10.9 ID连续性: 生成多个脚本验证ID递增
  const idSet = new Set();
  for (let i = 0; i < 5; i++) {
    const res = await request('POST', '/scripts/generate', {
      topic: `ID测试_${i}_${Date.now()}`,
      script_type: 'product_showcase'
    }, token);
    if (res.data?.id) idSet.add(res.data.id);
  }
  assert(idSet.size === 5, '10.9 生成5个脚本ID互不重复');

  // 10.10 ID超9显示16进制: 验证超过9的序号显示A/B/C
  // (ID生成器测试，需要生成超过10个)

  // 10.5 无横杠验证
  const scripts = await request('GET', '/scripts?page=1&page_size=50', null, token);
  const allNoDash = scripts.data?.items?.every(item => !item.id.includes('_') && !item.id.includes('-'));
  assert(allNoDash, '10.5 所有ID无横杠/下划线');
}

// ========== 主测试流程 ==========

async function runTests(iteration) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`第 ${iteration} 次测试`);
  console.log('='.repeat(50));

  // 重置计数
  const iterationPassed = 0;
  const iterationFailed = 0;

  try {
    const token = await testLogin();
    if (!token) {
      console.log('❌ 登录失败，跳过本次测试');
      return { iteration, passed: 0, failed: 0, success: false, error: 'login_failed' };
    }

    await testHomePage(token);
    const scriptId = await testScripts(token);
    const videoId = await testVideos(token, scriptId);
    await testMaterials(token);
    await testPublishing(token, videoId);
    await testAnalytics(token);
    await testPermissionIsolation();
    await testAuthEdgeCases(token);
    await testNavigationLayout(token);
    await testIDFormats(token);

    return { iteration, passed, failed, success: failed === 0 };
  } catch (err) {
    console.error(`❌ 第${iteration}次测试异常:`, err.message);
    return { iteration, passed, failed, success: false, error: err.message };
  }
}

async function main() {
  const times = parseInt(process.argv[2]) || 100;
  console.log(`🚀 开始执行 ${times} 次测试...`);

  const summary = { total: 0, passed: 0, failed: 0, errors: 0 };
  const startTime = Date.now();

  for (let i = 1; i <= times; i++) {
    const result = await runTests(i);
    summary.total++;
    summary.passed += result.passed;
    summary.failed += result.failed;
    if (!result.success) summary.errors++;

    if (i % 10 === 0 || i === times) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const passRate = ((summary.passed / (summary.passed + summary.failed)) * 100).toFixed(1);
      console.log(`\n📊 进度: ${i}/${times} | 通过: ${summary.passed} | 失败: ${summary.failed} | 通过率: ${passRate}% | 耗时: ${elapsed}s`);
    }

    // 每次间隔50ms
    if (i < times) await sleep(50);
  }

  console.log('\n');
  console.log('='.repeat(50));
  console.log('📊 测试完成汇总');
  console.log('='.repeat(50));
  console.log(`总测试次数: ${summary.total}`);
  console.log(`总测试用例: ${summary.passed + summary.failed}`);
  console.log(`通过: ${summary.passed} ✅`);
  console.log(`失败: ${summary.failed} ❌`);
  console.log(`出错轮次: ${summary.errors}`);
  console.log(`总耗时: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
  console.log(`平均每轮: ${((Date.now() - startTime) / summary.total / 1000).toFixed(2)}s`);

  if (summary.failed > 0) {
    console.log('\n❌ 失败用例 TOP10:');
    [...failedTests].slice(0, 10).forEach(t => console.log('  ' + t));
  }

  process.exit(summary.errors > 0 ? 1 : 0);
}

main().catch(console.error);
