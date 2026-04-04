import { createServerClient } from '@/lib/supabase-server'
import StudentDashboardClient from './StudentDashboardClient'

export default async function StudentDashboard() {
  const supabase = await createServerClient()
  
  const quoteList = [
    '"Hành trình vạn dặm bắt đầu từ một bước chân." — Lão Tử',
    '"Tương lai thuộc về người học hỏi không ngừng." — Eric Hoffer',
    '"Code today, change the world tomorrow." — AIgenlabs',
  ]
  const quoteIndex = new Date().getMinutes() % quoteList.length
  const quote = quoteList[quoteIndex]

  let name = 'Học sinh'
  let enrollment = null
  let overallPct = 0
  let nextSubject = null
  let allLevels = []

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const [profileResult, levelsResult, enrollmentsResult, progressResult] =
      await Promise.all([
        supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle(),
        supabase
          .from('levels')
          .select('id, name, subject_count, sort_order, subjects(id, name, sort_order)')
          .order('sort_order'),
        supabase
          .from('enrollments')
          .select('level_id, status, enrolled_at')
          .eq('student_id', user.id)
          .order('enrolled_at', { ascending: false }),
        supabase
          .from('progress')
          .select('subject_id, completed, subjects(level_id)')
          .eq('student_id', user.id),
      ])

    const profile = profileResult.data
    const levels = levelsResult.data || []
    const enrollments = enrollmentsResult.data || []
    const progressRows = progressResult.data || []

    name = profile?.full_name || 'Học sinh'

    const progressBySubject = {}
    const completedByLevel = {}

    for (const row of progressRows) {
      progressBySubject[row.subject_id] = row.completed
      if (row.completed && row.subjects?.level_id) {
        const levelId = row.subjects.level_id
        completedByLevel[levelId] = (completedByLevel[levelId] || 0) + 1
      }
    }

    const activeEnrollment = enrollments.find((item) => item.status === 'active') || null
    const activeLevel = activeEnrollment
      ? levels.find((level) => level.id === activeEnrollment.level_id) || null
      : null

    enrollment = activeEnrollment
      ? {
          ...activeEnrollment,
          levels: activeLevel
            ? {
                id: activeLevel.id,
                name: activeLevel.name,
                subject_count: activeLevel.subject_count,
              }
            : null,
        }
      : null

    if (activeLevel) {
      const activeSubjects = [...(activeLevel.subjects || [])].sort(
        (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
      )
      const total = activeSubjects.length || activeLevel.subject_count || 1
      const done = activeSubjects.filter((subject) => progressBySubject[subject.id]).length

      overallPct = Math.round((done / total) * 100)
      nextSubject = activeSubjects.find((subject) => !progressBySubject[subject.id]) || null
    } else {
      overallPct = 0
      nextSubject = null
    }

    allLevels = levels.map((level) => {
      const enrolled = enrollments.some((item) => item.level_id === level.id)
      const totalCount = level.subject_count || level.subjects?.length || 1

      return {
        ...level,
        enrolled,
        completedCount: completedByLevel[level.id] || 0,
        totalCount,
      }
    })
  }

  return (
    <StudentDashboardClient
      name={name}
      quote={quote}
      enrollment={enrollment}
      overallPct={overallPct}
      nextSubject={nextSubject}
      allLevels={allLevels}
    />
  )
}
