/**
 * kt student - Student management
 *
 * Commands:
 *   kt student list
 *   kt student add --name "..." --email "..." --level 1
 *   kt student progress --id <uuid>
 */

import { Command } from 'commander'
import { createClient } from '@supabase/supabase-js'
import { formatOutput, success, error } from '../utils/output.js'

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    return null
  }

  return createClient(url, serviceKey)
}

function generatePassword() {
  const suffix = Math.random().toString(36).slice(-6).toUpperCase()
  return `KidTech@${suffix}`
}

function formatDate(value) {
  if (!value) {
    return '—'
  }

  return new Date(value).toLocaleDateString('vi-VN')
}

function getLatestEnrollment(enrollments = []) {
  return [...enrollments].sort(
    (a, b) => new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime()
  )[0]
}

export const studentCommand = new Command('student')
  .description('Student management (list, add, progress)')

studentCommand
  .command('list')
  .description('List all students')
  .option('--level <level>', 'Filter by level id (1, 2, 3)')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      const supabase = createAdminClient()

      if (!supabase) {
        error(
          'Supabase service role chưa được cấu hình. Cần NEXT_PUBLIC_SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY.',
          options
        )
        return
      }

      const { data, error: queryError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          phone,
          created_at,
          enrollments (
            id,
            level_id,
            status,
            enrolled_at,
            levels ( name )
          )
        `)
        .eq('role', 'student')
        .order('created_at', { ascending: false })

      if (queryError) {
        error(`Failed to list students: ${queryError.message}`, options)
        return
      }

      let rows = (data || []).map((student) => {
        const latest = getLatestEnrollment(student.enrollments)
        return {
          id: student.id,
          name: student.full_name || '—',
          phone: student.phone || '—',
          level: latest?.levels?.name || '—',
          level_id: latest?.level_id || '—',
          status: latest?.status || '—',
          enrolled: latest?.enrolled_at ? formatDate(latest.enrolled_at) : '—',
          created_at: formatDate(student.created_at),
        }
      })

      if (options.level) {
        rows = rows.filter((row) => String(row.level_id) === String(options.level))
      }

      if (!options.json) {
        console.log('📋 Danh sách học sinh\n')
      }

      formatOutput(rows, options)
    } catch (err) {
      error(`Failed to list students: ${err.message}`, options)
    }
  })

studentCommand
  .command('add')
  .description('Add a new student')
  .requiredOption('--name <name>', 'Student full name')
  .requiredOption('--email <email>', 'Student email')
  .option('--phone <phone>', 'Phone number')
  .option('--level <level>', 'Initial level id', '1')
  .option('--parent <parent>', 'Parent name')
  .option('--parent-phone <parentPhone>', 'Parent phone number')
  .option('--password <password>', 'Custom password (optional)')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      const supabase = createAdminClient()

      if (!supabase) {
        error(
          'Supabase service role chưa được cấu hình. Cần NEXT_PUBLIC_SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY.',
          options
        )
        return
      }

      const password = options.password || generatePassword()

      const { data: authResult, error: createError } = await supabase.auth.admin.createUser({
        email: options.email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: options.name,
          phone: options.phone || null,
        },
      })

      if (createError) {
        error(`Failed to add student: ${createError.message}`, options)
        return
      }

      const userId = authResult?.user?.id
      if (!userId) {
        error('Failed to add student: user ID not returned', options)
        return
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: options.name,
          phone: options.phone || null,
          parent_name: options.parent || null,
          parent_phone: options.parentPhone || null,
        })
        .eq('id', userId)

      if (profileError) {
        error(`Student created but profile update failed: ${profileError.message}`, options)
        return
      }

      const levelId = Number(options.level)
      if (Number.isFinite(levelId) && levelId > 0) {
        const { error: enrollmentError } = await supabase
          .from('enrollments')
          .insert({
            student_id: userId,
            level_id: levelId,
            status: 'active',
          })

        if (enrollmentError) {
          error(
            `Student created but enrollment failed: ${enrollmentError.message}`,
            options
          )
          return
        }
      }

      const result = {
        id: userId,
        full_name: options.name,
        email: options.email,
        phone: options.phone || null,
        parent_name: options.parent || null,
        parent_phone: options.parentPhone || null,
        level_id: levelId,
        password,
        created_at: new Date().toISOString(),
      }

      success(`Student "${options.name}" added successfully`, options)
      formatOutput(result, options)
    } catch (err) {
      error(`Failed to add student: ${err.message}`, options)
    }
  })

studentCommand
  .command('progress')
  .description('View student progress')
  .requiredOption('--id <id>', 'Student UUID')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      const supabase = createAdminClient()

      if (!supabase) {
        error(
          'Supabase service role chưa được cấu hình. Cần NEXT_PUBLIC_SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY.',
          options
        )
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', options.id)
        .single()

      if (profileError || !profile) {
        error('Student not found', options)
        return
      }

      const { data: enrollments, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('level_id, status, levels(name, subject_count)')
        .eq('student_id', options.id)

      const { data: progressRows, error: progressError } = await supabase
        .from('progress')
        .select('subject_id, completed, completed_at, subjects(name, level_id)')
        .eq('student_id', options.id)

      if (enrollmentError || progressError) {
        error(
          `Failed to get progress: ${enrollmentError?.message || progressError?.message}`,
          options
        )
        return
      }

      const grouped = (enrollments || []).map((enrollment) => {
        const completedCount = (progressRows || []).filter(
          (row) => row.completed && row.subjects?.level_id === enrollment.level_id
        ).length
        const total = enrollment.levels?.subject_count || 0

        return {
          level_id: enrollment.level_id,
          level: enrollment.levels?.name || '—',
          status: enrollment.status,
          completed: completedCount,
          total,
          percentage: total > 0 ? Math.round((completedCount / total) * 100) : 0,
        }
      })

      const overallCompleted = grouped.reduce((sum, level) => sum + level.completed, 0)
      const overallTotal = grouped.reduce((sum, level) => sum + level.total, 0)

      const payload = {
        student_id: profile.id,
        student_name: profile.full_name,
        levels: grouped,
        overall_percentage:
          overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 0,
      }

      if (!options.json) {
        console.log(`📊 Progress for ${profile.full_name}\n`)
      }

      formatOutput(payload, options)
    } catch (err) {
      error(`Failed to get progress: ${err.message}`, options)
    }
  })
