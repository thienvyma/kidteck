export async function requireTargetStudent(adminClient, studentId) {
  const { data: studentProfile, error: profileError } = await adminClient
    .from('profiles')
    .select('id, role, full_name')
    .eq('id', studentId)
    .maybeSingle()

  if (profileError) {
    return { error: profileError.message, status: 400 }
  }

  if (!studentProfile) {
    return { error: 'Student profile not found', status: 404 }
  }

  if (studentProfile.role !== 'student') {
    return {
      error: 'Only student accounts can be managed from this endpoint',
      status: 400,
    }
  }

  return { student: studentProfile }
}
