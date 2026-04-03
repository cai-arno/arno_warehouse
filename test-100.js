/**
 * 短视频工厂 - 自动化测试脚本
 * 用法: node test-100.js [次数]
 * 默认执行100遍
 */
import https from 'https';
import http from 'http';

const BASE_URL = 'http://localhost:8000/api/v1';
const TEST_PHONE = '18180769518';
const TEST_CODE = '123456';

let passed = 0;
let failed = 0;
const results = [];

function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0,-1) : BASE_URL;
    // 移除开头的/避免被当作绝对路径
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const url = new URL(cleanPath, base + '/');
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 8000),
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Connection': 'close',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    };

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
      if (err.message !== 'socket hang up') reject(err);
      else resolve({ status: 0, data: { error: 'socket hang up' } });
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
  }
}

// ========== 测试用例 ==========

async function testLogin() {
  console.log('\n📱 测试登录模块...');

  // 1.1 手机号格式校验 - 无效格式
  let res = await request('POST', '/auth/send-code?phone=12345');
  assert(res.status === 400, '1.1 手机号格式校验-过短');

  // 1.1 手机号格式校验 - 非1开头
  res = await request('POST', '/auth/send-code?phone=2987654321');
  assert(res.status === 400, '1.1 手机号格式校验-非1开头');

  // 1.3 发送验证码
  res = await request('POST', `/auth/send-code?phone=${TEST_PHONE}`);
  assert(res.status === 200 && res.data.success, '1.3 发送验证码成功');

  // 1.6 登录成功
  res = await request('POST', `/auth/login?phone=${TEST_PHONE}&code=${TEST_CODE}`);
  assert(res.status === 200 && res.data.access_token, '1.6 登录成功');
  return res.data.access_token;
}

async function testScripts(token) {
  console.log('\n📝 测试脚本模块...');

  // 3.1 生成脚本按钮 (无页面操作，测试生成API)
  const res = await request('POST', '/scripts/generate', {
    topic: `测试脚本_${Date.now()}`,
    script_type: 'product_showcase',
    quantity: 1,
    style: '轻松幽默'
  }, token);
  assert(res.status === 200, '3.3 生成脚本成功');
  const scriptId = res.data?.id;

  // 3.5 脚本列表
  const listRes = await request('GET', '/scripts?page=1&page_size=20', null, token);
  assert(listRes.status === 200, '3.6 脚本列表加载成功');

  // 3.7 查看脚本详情
  if (scriptId) {
    const detailRes = await request('GET', `/scripts/${scriptId}`, null, token);
    assert(detailRes.status === 200 && detailRes.data?.hook !== undefined, '3.7 脚本详情含hook/body/cta');
  }

  // 10.2 脚本ID格式
  if (scriptId) {
    assert(/^SCRI[A-F0-9]{8}$/.test(scriptId), '10.2 脚本ID格式正确(SCRI+8位16进制)');
  }

  // 3.8 删除脚本
  if (scriptId) {
    const delRes = await request('DELETE', `/scripts/${scriptId}`, null, token);
    assert(delRes.status === 200, '3.8 删除脚本成功');
  }

  return scriptId;
}

async function testVideos(token, scriptId) {
  console.log('\n🎬 测试视频模块...');

  // 4.1 视频列表
  const listRes = await request('GET', '/videos?page=1&page_size=20', null, token);
  assert(listRes.status === 200, '4.1 视频列表加载成功');

  // 11.1 从脚本创建视频 (如果传入了scriptId)
  if (scriptId) {
    const createRes = await request('POST', '/videos', {
      script_id: scriptId,
      template_id: null
    }, token);
    assert(createRes.status === 200, '11.1 从脚本创建视频成功');
    const videoId = createRes.data?.id;

    if (videoId) {
      // 10.3 视频ID格式
      assert(/^VIDE[A-F0-9]{8}$/.test(videoId), '10.3 视频ID格式正确(VIDE+8位16进制)');

      // 4.3/4.4 开始渲染
      const renderRes = await request('POST', '/videos/render', { video_id: videoId }, token);
      assert(renderRes.status === 200, '4.4 开始渲染成功');

      // 4.7 预览 (已完成状态)
      const detailRes = await request('GET', `/videos/${videoId}`, null, token);
      assert(detailRes.status === 200, '4.7 获取视频详情');
    }
  }
}

async function testMaterials(token) {
  console.log('\n🖼️ 测试素材模块...');

  // 5.6-5.9 类型筛选
  const types = ['video', 'image', 'audio', 'voiceover', ''];
  for (const type of types) {
    const url = type ? `/materials?material_type=${type}` : '/materials';
    const res = await request('GET', url, null, token);
    assert(res.status === 200, `5.${types.indexOf(type) + 6} 类型筛选-${type || '全部'}`);
  }

  // 5.10 关键词搜索
  const searchRes = await request('GET', '/materials?keyword=test', null, token);
  assert(searchRes.status === 200, '5.10 关键词搜索');

  // 5.12 素材列表
  const listRes = await request('GET', '/materials?page=1&page_size=20', null, token);
  assert(listRes.status === 200, '5.12 素材列表加载成功');
}

async function testPublishing(token, videoId) {
  console.log('\n🚀 测试发布模块...');

  // 6.1 发布列表
  const listRes = await request('GET', '/publishing?page=1&page_size=20', null, token);
  assert(listRes.status === 200, '6.1 发布列表加载成功');

  // 11.2 从视频创建发布
  if (videoId) {
    const platforms = ['douyin', 'kuaishou', 'wechat', 'xigua', 'bilibili'];
    for (const platform of platforms) {
      const createRes = await request('POST', '/publishing', {
        video_id: videoId,
        platform
      }, token);
      assert(createRes.status === 200, `11.2 创建发布-${platform}`);
    }
  }
}

async function testAnalytics(token) {
  console.log('\n📊 测试数据看板...');

  // 7.1 核心指标
  const overviewRes = await request('GET', '/analytics/overview', null, token);
  assert(overviewRes.status === 200, '7.1 核心指标加载');

  // 7.3 趋势图
  const trendsRes = await request('GET', '/analytics/trends?days=7', null, token);
  assert(trendsRes.status === 200, '7.3 趋势图加载');

  // 7.5 平台分布
  const platformsRes = await request('GET', '/analytics/platforms', null, token);
  assert(platformsRes.status === 200, '7.5 平台分布加载');

  // 7.7 热门视频
  const topRes = await request('GET', '/analytics/top?limit=10', null, token);
  assert(topRes.status === 200, '7.7 热门视频TOP10加载');
}

async function testPermissionIsolation() {
  console.log('\n🔐 测试权限隔离...');

  // 9.1-9.5 登录两个不同账号，数据应互不可见
  // 先登录账号1
  const login1 = await request('POST', `/auth/login?phone=18180769518&code=${TEST_CODE}`);
  const token1 = login1.data?.access_token;

  // 创建账号1的数据
  const create1 = await request('POST', '/scripts/generate', {
    topic: `账号1私有数据_${Date.now()}`,
    script_type: 'product_showcase'
  }, token1);
  const account1ScriptId = create1.data?.id;

  // 登录账号2
  const login2 = await request('POST', `/auth/login?phone=18180769519&code=${TEST_CODE}`);
  const token2 = login2.data?.access_token;

  // 账号2查看列表，不应看到账号1的数据
  const list2 = await request('GET', '/scripts?page=1&page_size=100', null, token2);
  const account1DataVisible = list2.data?.items?.some(item => item.id === account1ScriptId);
  assert(!account1DataVisible, '9.1 脚本归属-账号2看不到账号1数据');

  // 清理
  if (account1ScriptId && token1) {
    await request('DELETE', `/scripts/${account1ScriptId}`, null, token1);
  }
}

async function testHomePage(token) {
  console.log('\n🏠 测试首页...');

  // 2.1 首页数据加载 (脚本/视频/发布统计)
  const scriptsRes = await request('GET', '/scripts?page_size=5', null, token);
  assert(scriptsRes.status === 200, '2.1 首页-脚本统计');

  const videosRes = await request('GET', '/videos?page_size=5', null, token);
  assert(videosRes.status === 200, '2.1 首页-视频统计');

  const publishRes = await request('GET', '/publishing?page_size=5', null, token);
  assert(publishRes.status === 200, '2.1 首页-发布统计');
}

async function testAuthMe(token) {
  console.log('\n🔑 测试认证...');

  // 8.3 用户信息
  const meRes = await request('GET', '/auth/me', null, token);
  assert(meRes.status === 200 && meRes.data?.phone, '8.3 用户信息正确');

  // 11.5 Token过期/无效
  const invalidRes = await request('GET', '/scripts', null, 'invalid_token');
  assert(invalidRes.status === 401, '11.5 无效Token被拒绝');
}

// ========== 主测试流程 ==========

async function runTests(iteration) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`第 ${iteration} 次测试`);
  console.log('='.repeat(50));

  try {
    const token = await testLogin();
    if (!token) throw new Error('登录失败，无法继续');

    await testHomePage(token);
    await testScripts(token);
    const scriptId = await testScripts(token);
    await testVideos(token, scriptId);
    await testMaterials(token);
    await testPublishing(token, scriptId);
    await testAnalytics(token);
    await testPermissionIsolation();
    await testAuthMe(token);

    console.log(`\n📈 第${iteration}次: 通过 ${passed} / 失败 ${failed}`);
    return { iteration, passed, failed, success: failed === 0 };
  } catch (err) {
    console.error(`❌ 第${iteration}次测试异常:`, err.message);
    failed++;
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

    // 每10次报告一次进度
    if (i % 10 === 0 || i === times) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`\n📊 进度: ${i}/${times} | 累计通过: ${summary.passed} | 累计失败: ${summary.failed} | 耗时: ${elapsed}s`);
    }

    // 每次间隔100ms，避免压垮服务器
    if (i < times) await sleep(100);
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
    console.log('\n❌ 失败用例:');
    results.filter(r => r.startsWith('❌')).forEach(r => console.log('  ' + r));
  }

  process.exit(summary.errors > 0 ? 1 : 0);
}

main().catch(console.error);
