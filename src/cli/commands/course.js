/**
 * kt course — Course management
 * 
 * Commands:
 *   kt course list                   List all courses
 *   kt course list --level 1         Filter by level
 *   kt course add --name "..." --level 1
 *   kt course info --id <id>         View course details
 */

import { Command } from 'commander';
import { formatOutput, success, error } from '../utils/output.js';

/**
 * Full curriculum data
 */
const CURRICULUM = {
  1: {
    name: 'Level 1: Digital Foundation',
    age: '12-14 tuổi',
    subjects: [
      { id: 'L1-01', name: 'Digital Literacy', hours: 24, description: 'Kỹ năng số: tìm kiếm thông tin, đánh giá nguồn, an toàn mạng' },
      { id: 'L1-02', name: 'Computational Thinking', hours: 24, description: 'Tư duy giải thuật: phân rã, nhận diện pattern, trừu tượng hóa' },
    ]
  },
  2: {
    name: 'Level 2: Problem Solver',
    age: '15-16 tuổi',
    subjects: [
      { id: 'L2-01', name: 'Web Development', hours: 36, description: 'HTML/CSS/JS — Xây dựng website thực tế' },
      { id: 'L2-02', name: 'Data & AI Basics', hours: 24, description: 'Dữ liệu, thống kê, ML cơ bản' },
      { id: 'L2-03', name: 'Problem Solving Lab', hours: 36, description: 'Dự án thực tế — giải quyết bài toán trong đời thực' },
      { id: 'L2-04', name: 'Python Fundamentals', hours: 30, description: 'Lập trình Python từ cơ bản đến trung cấp' },
      { id: 'L2-05', name: 'Creative Tech', hours: 24, description: 'Thiết kế & sáng tạo với công nghệ' },
    ]
  },
  3: {
    name: 'Level 3: AI Builder',
    age: '16-17 tuổi',
    subjects: [
      { id: 'L3-01', name: 'AI & Machine Learning', hours: 36, description: 'Deep learning, NLP, Computer Vision' },
      { id: 'L3-02', name: 'Vibe Coding', hours: 36, description: 'Xây dựng ứng dụng AI với Vibe Coding methodology' },
      { id: 'L3-03', name: 'Full-Stack Project', hours: 48, description: 'Dự án full-stack: concept → design → deploy' },
      { id: 'L3-04', name: 'AI Ethics & Society', hours: 18, description: 'Đạo đức AI, tác động xã hội' },
      { id: 'L3-05', name: 'Portfolio & Career', hours: 24, description: 'Portfolio, interview prep, career path' },
      { id: 'L3-06', name: 'Advanced Projects', hours: 48, description: 'Capstone: ứng dụng AI giải quyết vấn đề thực' },
      { id: 'L3-07', name: 'Startup Mindset', hours: 18, description: 'Tư duy khởi nghiệp với AI' },
      { id: 'L3-08', name: 'Research & Innovation', hours: 24, description: 'Nghiên cứu khoa học, innovation lab' },
    ]
  }
};

export const courseCommand = new Command('course')
  .description('Course management (list, add, info)');

courseCommand
  .command('list')
  .description('List all courses/subjects')
  .option('--level <level>', 'Filter by level (1, 2, 3)')
  .option('--json', 'Output as JSON')
  .action((options) => {
    try {
      if (options.level) {
        const level = parseInt(options.level);
        const levelData = CURRICULUM[level];
        
        if (!levelData) {
          error(`Level ${level} not found. Valid: 1, 2, 3`, options);
          return;
        }
        
        if (!options.json) {
          console.log(`📚 ${levelData.name} (${levelData.age})\n`);
        }
        formatOutput(levelData.subjects, options);
      } else {
        // All levels
        const allSubjects = [];
        for (const [level, data] of Object.entries(CURRICULUM)) {
          for (const subject of data.subjects) {
            allSubjects.push({ ...subject, level: parseInt(level), level_name: data.name });
          }
        }
        
        if (!options.json) {
          console.log('📚 Toàn bộ chương trình AIgenlabs\n');
          for (const [level, data] of Object.entries(CURRICULUM)) {
            console.log(`\n🎯 ${data.name} (${data.age}) — ${data.subjects.length} môn`);
            for (const s of data.subjects) {
              console.log(`   ${s.id} │ ${s.name} (${s.hours}h)`);
            }
          }
        } else {
          formatOutput(allSubjects, options);
        }
      }
    } catch (err) {
      error(`Failed to list courses: ${err.message}`, options);
    }
  });

courseCommand
  .command('info')
  .description('View course details')
  .requiredOption('--id <id>', 'Course ID (e.g. L1-01)')
  .option('--json', 'Output as JSON')
  .action((options) => {
    try {
      // Search across all levels
      for (const [level, data] of Object.entries(CURRICULUM)) {
        const subject = data.subjects.find(s => s.id === options.id);
        if (subject) {
          const result = {
            ...subject,
            level: parseInt(level),
            level_name: data.name,
            age_range: data.age,
            status: 'active'
          };
          
          if (!options.json) {
            console.log(`📖 Course Details: ${subject.name}\n`);
          }
          formatOutput(result, options);
          return;
        }
      }
      
      error(`Course "${options.id}" not found`, options);
    } catch (err) {
      error(`Failed to get course info: ${err.message}`, options);
    }
  });

courseCommand
  .command('summary')
  .description('Curriculum summary (levels, subjects count, total hours)')
  .option('--json', 'Output as JSON')
  .action((options) => {
    const summary = Object.entries(CURRICULUM).map(([level, data]) => ({
      level: parseInt(level),
      name: data.name,
      age: data.age,
      subjects: data.subjects.length,
      total_hours: data.subjects.reduce((sum, s) => sum + s.hours, 0)
    }));
    
    if (!options.json) {
      console.log('📊 AIgenlabs Curriculum Summary\n');
    }
    formatOutput(summary, options);
  });
