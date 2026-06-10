import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'yanglingsanzhi',
};

async function seed() {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database');

    // Seed categories - 5 product series
    const categories = [
      ['土壤水蚀监测', 'soil-water-erosion', '水土流失监测设备与系统，涵盖径流小区监测、坡面侵蚀监测等', 1],
      ['土壤风蚀监测', 'soil-wind-erosion', '风蚀监测设备与系统，涵盖风蚀量监测、沙尘采集等', 2],
      ['生态气象监测', 'eco-meteorology', '生态环境与气象监测设备，涵盖气象站、蒸散量监测等', 3],
      ['盐碱地监测治理', 'saline-alkali', '盐碱地监测与治理设备，涵盖土壤盐分监测、改良方案等', 4],
      ['智慧水保云平台', 'smart-cloud', '水土保持信息化云平台，涵盖数据管理、分析展示、预警预报等', 5],
    ];

    for (const [name, slug, description, sortOrder] of categories) {
      await connection.query(
        'INSERT IGNORE INTO categories (name, slug, description, sort_order) VALUES (?, ?, ?, ?)',
        [name, slug, description, sortOrder]
      );
    }
    console.log('Categories seeded');

    // Get category IDs
    const [catRows] = await connection.query('SELECT id, slug FROM categories');
    const catMap = {};
    for (const row of catRows) {
      catMap[row.slug] = row.id;
    }

    // Seed products - 1-2 per category
    const products = [
      {
        categoryId: catMap['soil-water-erosion'],
        name: 'SZ-SW01 径流泥沙自动监测仪',
        slug: 'sz-sw01',
        model: 'SZ-SW01',
        summary: '适用于径流小区的自动径流泥沙监测设备，可实时采集径流量和泥沙含量数据',
        description: 'SZ-SW01型径流泥沙自动监测仪是杨凌三智科技自主研发的水土保持监测核心设备。该设备采用先进的光电传感技术和自动采样技术，可实现对径流小区径流量和泥沙含量的实时自动监测，数据远程传输至云平台，支持长时间无人值守运行。',
        applicationScenes: '径流小区监测、坡面侵蚀监测、小流域水土流失监测',
        sortOrder: 1,
      },
      {
        categoryId: catMap['soil-water-erosion'],
        name: 'SZ-SW02 坡面侵蚀监测系统',
        slug: 'sz-sw02',
        model: 'SZ-SW02',
        summary: '集成了坡面侵蚀多参数监测的综合性监测系统',
        description: 'SZ-SW02型坡面侵蚀监测系统集成了降雨量、径流量、泥沙含量、土壤含水率等多参数监测功能，可全面评估坡面侵蚀状况。',
        applicationScenes: '坡面侵蚀研究、水土保持效益评估、生态修复监测',
        sortOrder: 2,
      },
      {
        categoryId: catMap['soil-wind-erosion'],
        name: 'SZ-WF01 风蚀自动监测站',
        slug: 'sz-wf01',
        model: 'SZ-WF01',
        summary: '用于风蚀区自动监测风蚀量和沙尘输移的专用设备',
        description: 'SZ-WF01型风蚀自动监测站采用集沙仪与称重系统相结合的方式，可自动记录风蚀量数据，配合气象传感器实现风蚀与气象因子的关联分析。',
        applicationScenes: '风蚀区监测、荒漠化评估、防风固沙效益监测',
        sortOrder: 1,
      },
      {
        categoryId: catMap['eco-meteorology'],
        name: 'SZ-EM01 生态气象监测站',
        slug: 'sz-em01',
        model: 'SZ-EM01',
        summary: '多要素生态气象监测设备，涵盖温湿度、风速风向、降雨、辐射等参数',
        description: 'SZ-EM01型生态气象监测站可同时监测气温、湿度、风速、风向、降雨量、太阳辐射、光合有效辐射等多项生态气象参数，为生态环境评估提供基础数据支撑。',
        applicationScenes: '生态气象观测、小气候监测、农林气象服务',
        sortOrder: 1,
      },
      {
        categoryId: catMap['saline-alkali'],
        name: 'SZ-SA01 土壤盐分在线监测系统',
        slug: 'sz-sa01',
        model: 'SZ-SA01',
        summary: '实时在线监测土壤盐分、pH值等关键指标的专用系统',
        description: 'SZ-SA01型土壤盐分在线监测系统采用高精度盐分传感器，可实时监测不同深度土壤层的盐分含量和pH值，支持多点布设和远程数据传输，为盐碱地治理提供数据支撑。',
        applicationScenes: '盐碱地监测、土壤改良评估、农田盐渍化预警',
        sortOrder: 1,
      },
      {
        categoryId: catMap['smart-cloud'],
        name: '智慧水保云平台',
        slug: 'smart-water-cloud',
        model: 'SZ-Cloud',
        summary: '水土保持大数据云平台，实现监测数据汇聚、分析、展示与预警',
        description: '智慧水保云平台是杨凌三智科技打造的水土保持信息化核心平台，整合了各类监测设备数据，提供数据可视化管理、统计分析、预警预报、报告生成等功能，支撑水土保持工作数字化转型。',
        applicationScenes: '水土保持信息化管理、监测数据汇聚分析、预警预报',
        sortOrder: 1,
      },
    ];

    for (const p of products) {
      await connection.query(
        'INSERT IGNORE INTO products (category_id, name, slug, model, summary, description, application_scenes, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [p.categoryId, p.name, p.slug, p.model, p.summary, p.description, p.applicationScenes, p.sortOrder]
      );
    }
    console.log('Products seeded');

    // Seed team members
    const teamMembers = [
      {
        name: '赵向辉',
        title: '总经理 / 高级工程师',
        bio: '30年机械设计及自动化领域经验，专注于水土保持监测设备的研发与制造，主导多项国家级科研项目，带领团队攻克了径流泥沙自动监测等多项技术难题。',
        isFeatured: 1,
        sortOrder: 1,
      },
      {
        name: '郭明航',
        title: '技术总监 / 研究员',
        bio: '35年水土保持工作经验，曾任中国科学院水利部水土保持研究所研究员，主持完成多项国家重点研发计划项目，在水土流失监测与评价领域具有深厚造诣。',
        isFeatured: 1,
        sortOrder: 2,
      },
      {
        name: '展小云',
        title: '科技副总经理 / 生态学博士',
        bio: '生态学博士，12年水土保持监测经验，专注于生态环境监测技术研发与应用，主持参与多项省部级科研项目，在生态修复与盐碱地治理方面有丰富经验。',
        isFeatured: 1,
        sortOrder: 3,
      },
    ];

    for (const m of teamMembers) {
      await connection.query(
        'INSERT IGNORE INTO team_members (name, title, bio, is_featured, sort_order) VALUES (?, ?, ?, ?, ?)',
        [m.name, m.title, m.bio, m.isFeatured, m.sortOrder]
      );
    }
    console.log('Team members seeded');

    // Seed cases
    const cases = [
      {
        title: '黄土高原坡面侵蚀监测项目',
        slug: 'loess-plateau-slope-erosion',
        summary: '在黄土高原典型侵蚀区部署SZ-SW01和SZ-SW02设备，建立坡面侵蚀监测网络',
        description: '本项目在黄土高原典型侵蚀区域部署了多台SZ-SW01径流泥沙自动监测仪和SZ-SW02坡面侵蚀监测系统，建立了覆盖多个坡面的侵蚀监测网络，实现了侵蚀数据的实时采集与远程传输，为区域水土流失评估提供了可靠数据支撑。',
        location: '陕西省延安市',
        province: '陕西',
        isFeatured: 1,
        sortOrder: 1,
      },
      {
        title: '内蒙古风蚀监测站建设项目',
        slug: 'inner-mongolia-wind-erosion',
        summary: '在内蒙古浑善达克沙地部署SZ-WF01风蚀自动监测站',
        description: '本项目在内蒙古浑善达克沙地边缘区域部署了SZ-WF01风蚀自动监测站，建立了风蚀动态监测系统，为荒漠化防治和防风固沙工程效果评估提供了科学依据。',
        location: '内蒙古锡林郭勒盟',
        province: '内蒙古',
        isFeatured: 1,
        sortOrder: 2,
      },
      {
        title: '新疆盐碱地监测治理示范项目',
        slug: 'xinjiang-saline-alkali',
        summary: '在新疆地区部署SZ-SA01土壤盐分监测系统，开展盐碱地改良示范',
        description: '本项目在新疆典型盐碱地区域部署了SZ-SA01土壤盐分在线监测系统，结合改良措施开展盐碱地治理示范，实现了土壤盐分动态实时监控，为大规模盐碱地治理提供了技术示范和数据支撑。',
        location: '新疆石河子市',
        province: '新疆',
        isFeatured: 1,
        sortOrder: 3,
      },
    ];

    for (const c of cases) {
      await connection.query(
        'INSERT IGNORE INTO cases (title, slug, summary, description, location, province, is_featured, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [c.title, c.slug, c.summary, c.description, c.location, c.province, c.isFeatured, c.sortOrder]
      );
    }
    console.log('Cases seeded');

    // Seed certificates
    const certificates = [
      {
        title: '径流泥沙自动监测仪发明专利',
        type: 'patent',
        certificateNumber: 'ZL201910123456.7',
        description: '径流泥沙自动监测方法及装置发明专利',
        issueDate: '2020-06-15',
        sortOrder: 1,
      },
      {
        title: 'CMA计量认证',
        type: 'cma',
        certificateNumber: 'CMA-2023-610000',
        description: '中国计量认证（CMA），证明本机构检测能力符合国家相关要求',
        issueDate: '2023-03-20',
        sortOrder: 2,
      },
      {
        title: '国家科技成果推广证书',
        type: 'promotion',
        certificateNumber: 'GJ-TG-2022-089',
        description: '水土保持监测关键技术装备被列为国家科技成果推广项目',
        issueDate: '2022-11-10',
        sortOrder: 3,
      },
    ];

    for (const cert of certificates) {
      await connection.query(
        'INSERT IGNORE INTO certificates (title, type, certificate_number, description, issue_date, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
        [cert.title, cert.type, cert.certificateNumber, cert.description, cert.issueDate, cert.sortOrder]
      );
    }
    console.log('Certificates seeded');

    console.log('\nSeed data completed!');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

seed();
