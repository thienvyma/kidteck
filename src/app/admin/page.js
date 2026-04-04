import { createServerClient } from '@/lib/supabase-server'
import AdminDashboardClient from './AdminDashboardClient'

export default async function AdminDashboard() {
  const supabase = await createServerClient()
  let adminName = 'Admin'

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    adminName = profile?.full_name || 'Admin'
  }

  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { count: studentCount },
    { data: paidPayments },
    { data: activeEnrollments },
    { data: allPayments },
    { data: recent },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student'),
    supabase
      .from('payments')
      .select('amount')
      .eq('status', 'paid')
      .gte('paid_at', firstDay),
    supabase
      .from('enrollments')
      .select('id, student_id, level_id, status, enrolled_at')
      .eq('status', 'active'),
    supabase
      .from('payments')
      .select('student_id, level_id, status, created_at'),
    supabase
      .from('enrollments')
      .select(`
        id,
        status,
        enrolled_at,
        profiles!inner(full_name),
        levels!inner(name)
      `)
      .order('enrolled_at', { ascending: false })
      .limit(5),
  ])

  const totalRevenue = (paidPayments || []).reduce(
    (sum, payment) => sum + (payment.amount || 0),
    0
  )

  const latestPaymentByEnrollment = new Map()
  for (const payment of allPayments || []) {
    const key = `${payment.student_id}:${payment.level_id}`
    const current = latestPaymentByEnrollment.get(key)

    if (
      !current ||
      new Date(payment.created_at || 0) > new Date(current.created_at || 0)
    ) {
      latestPaymentByEnrollment.set(key, payment)
    }
  }

  const unpaidActiveEnrollments = (activeEnrollments || []).filter((row) => {
    const latestPayment = latestPaymentByEnrollment.get(
      `${row.student_id}:${row.level_id}`
    )

    return latestPayment?.status !== 'paid'
  }).length

  const stats = {
    students: studentCount || 0,
    revenue: totalRevenue,
    activeEnrollments: activeEnrollments?.length || 0,
    unpaidActiveEnrollments,
  }

  const recentEnrollments = (recent || []).map((row) => ({
    id: row.id,
    name: row.profiles?.full_name || '—',
    level: row.levels?.name || '—',
    date: new Date(row.enrolled_at).toLocaleDateString('vi-VN'),
    status: row.status,
  }))

  return (
    <AdminDashboardClient
      adminName={adminName}
      stats={stats}
      recentEnrollments={recentEnrollments}
    />
  )
}
