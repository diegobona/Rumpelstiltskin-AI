import { refreshVideoTask } from '@libs/ai/video-task-status';
import { auth } from '@libs/auth';
import { creditService } from '@libs/credits';

export const maxDuration = 60;

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: new Headers(req.headers) });
    const userId = session?.user?.id;
    if (!userId) return Response.json({ error: 'unauthorized', message: 'Authentication required' }, { status: 401 });
    const taskId = new URL(req.url).searchParams.get('taskId');
    if (!taskId) return Response.json({ error: 'invalid_request', message: 'taskId is required' }, { status: 400 });
    const task = await refreshVideoTask(taskId, userId);
    if (!task) return Response.json({ error: 'not_found', message: 'Task not found' }, { status: 404 });
    return Response.json({
      success: true,
      data: { taskId, status: task.status, result: task.result, error: task.errorMessage },
      ...(task.status !== 'processing' ? { credits: { remaining: await creditService.getBalance(userId) } } : {}),
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('Video status API error:', error);
    return Response.json({ error: 'status_query_failed', message: 'Could not check the video yet. Please try again.' }, { status: 500 });
  }
}
