/**
 * kt db — Database operations
 * 
 * Commands:
 *   kt db seed    Seed demo data into Supabase
 *   kt db reset   Drop all data + re-seed
 *   kt db status  Check database connectivity
 */

import { Command } from 'commander';
import { formatOutput, success, error } from '../utils/output.js';

/**
 * Demo seed data for AIgenlabs
 */
const SEED_DATA = {
  levels: [
    { id: 1, name: 'Digital Foundation', age_range: '12-14 tuổi', description: 'Nền tảng số - Sử dụng công nghệ có ý thức' },
    { id: 2, name: 'Problem Solver', age_range: '15-16 tuổi', description: 'Giải quyết vấn đề - Tư duy logic & sáng tạo' },
    { id: 3, name: 'AI Builder', age_range: '16-17 tuổi', description: 'Xây dựng AI - Vibe Coding & ứng dụng thực tế' },
  ],
  subjects: [
    // Level 1
    { name: 'Digital Literacy', level_id: 1, description: 'Kỹ năng số căn bản: tìm kiếm, đánh giá nguồn tin, an toàn mạng' },
    { name: 'Computational Thinking', level_id: 1, description: 'Tư duy giải thuật: phân tích, pattern, abstraction' },
    // Level 2
    { name: 'Web Development', level_id: 2, description: 'HTML/CSS/JS — Xây dựng website thực tế' },
    { name: 'Data & AI Basics', level_id: 2, description: 'Dữ liệu, thống kê, machine learning cơ bản' },
    { name: 'Problem Solving Lab', level_id: 2, description: 'Dự án thực tế — giải quyết bài toán trong đời thực' },
    { name: 'Python Fundamentals', level_id: 2, description: 'Lập trình Python từ cơ bản đến trung cấp' },
    { name: 'Creative Tech', level_id: 2, description: 'Thiết kế & sáng tạo với công nghệ' },
    // Level 3
    { name: 'AI & Machine Learning', level_id: 3, description: 'Deep learning, NLP, Computer Vision' },
    { name: 'Vibe Coding', level_id: 3, description: 'Xây dựng ứng dụng AI với Vibe Coding methodology' },
    { name: 'Full-Stack Project', level_id: 3, description: 'Dự án full-stack: concept → design → deploy' },
    { name: 'AI Ethics & Society', level_id: 3, description: 'Đạo đức AI, tác động xã hội, tương lai công nghệ' },
    { name: 'Portfolio & Career', level_id: 3, description: 'Xây dựng portfolio, chuẩn bị career trong tech' },
    { name: 'Advanced Projects', level_id: 3, description: 'Capstone projects — ứng dụng AI giải quyết vấn đề thực' },
    { name: 'Startup Mindset', level_id: 3, description: 'Tư duy khởi nghiệp với AI & công nghệ' },
    { name: 'Research & Innovation', level_id: 3, description: 'Nghiên cứu khoa học, innovation lab' },
  ],
  demo_students: [
    { full_name: 'Nguyễn Minh Anh', email: 'minhanh@demo.aigenlabs.vn', phone: '0901234567', level: 1, parent_name: 'Nguyễn Văn Hùng' },
    { full_name: 'Trần Gia Bảo', email: 'giabao@demo.aigenlabs.vn', phone: '0912345678', level: 2, parent_name: 'Trần Thị Mai' },
    { full_name: 'Lê Phương Thảo', email: 'phuongthao@demo.aigenlabs.vn', phone: '0923456789', level: 3, parent_name: 'Lê Quốc Tuấn' },
  ],
  admin: {
    email: 'admin@aigenlabs.vn',
    full_name: 'AIgenlabs Admin',
    role: 'admin'
  }
};

export const dbCommand = new Command('db')
  .description('Database operations (seed, reset, status)');

dbCommand
  .command('seed')
  .description('Seed demo data into Supabase')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      // Check if Supabase is configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) {
        error('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL in .env.local', options);
        console.log('\nSeed data (offline preview):');
        formatOutput(SEED_DATA, { json: true });
        return;
      }

      // TODO: When Supabase is configured, use @supabase/supabase-js to insert
      success(`Would seed ${SEED_DATA.levels.length} levels, ${SEED_DATA.subjects.length} subjects, ${SEED_DATA.demo_students.length} demo students`, options);
      
      if (options.json) {
        formatOutput({ action: 'seed', data: SEED_DATA, status: 'preview' }, options);
      } else {
        console.log('\n📊 Seed data preview:');
        console.log(`  ${SEED_DATA.levels.length} levels`);
        console.log(`  ${SEED_DATA.subjects.length} subjects`);
        console.log(`  ${SEED_DATA.demo_students.length} demo students`);
        console.log(`  1 admin account`);
        console.log('\n💡 Run after Supabase setup to insert into database.');
      }
    } catch (err) {
      error(`Seed failed: ${err.message}`, options);
    }
  });

dbCommand
  .command('status')
  .description('Check database connectivity')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    const status = {
      supabase_url: supabaseUrl ? 'configured' : 'not configured',
      supabase_key: supabaseKey ? 'configured' : 'not configured',
      connection: supabaseUrl ? 'ready (needs verification)' : 'not available',
      tables: [
        'profiles',
        'levels',
        'subjects',
        'enrollments',
        'progress',
        'payments',
        'blogs',
        'landing_leads',
        'landing_content',
      ]
    };
    
    formatOutput(status, options);
  });

dbCommand
  .command('export')
  .description('Export seed data as JSON')
  .option('--json', 'Output as JSON')
  .action((options) => {
    formatOutput(SEED_DATA, { json: true });
  });
