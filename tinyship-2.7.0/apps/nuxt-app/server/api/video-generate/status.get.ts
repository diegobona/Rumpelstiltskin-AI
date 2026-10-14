import { refreshVideoTask } from '@libs/ai/video-task-status'
import { auth } from '@libs/auth'
import { creditService } from '@libs/credits'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user || (await auth.api.getSession({ headers: new Headers(event.node.req.headers as HeadersInit) }))?.user
    const userId = user?.id
    if (!userId) throw createError({ statusCode: 401, data: { error: 'unauthorized', message: 'Authentication required' } })
    const query = getQuery(event)
    const taskId = typeof query.taskId === 'string' ? query.taskId : ''
    if (!taskId) throw createError({ statusCode: 400, data: { error: 'invalid_request', message: 'taskId is required' } })
    const task = await refreshVideoTask(taskId, userId)
    if (!task) throw createError({ statusCode: 404, data: { error: 'not_found', message: 'Task not found' } })
    setResponseHeader(event, 'Cache-Control', 'private, no-store')
    return {
      success: true,
      data: { taskId, status: task.status, result: task.result, error: task.errorMessage },
      ...(task.status !== 'processing' ? { credits: { remaining: await creditService.getBalance(userId) } } : {}),
    }
  } catch (error: any) {
    console.error('Video status API error:', error)
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, data: { error: 'status_query_failed', message: 'Could not check the video yet. Please try again.' } })
  }
})
