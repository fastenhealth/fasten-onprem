export class BackgroundJob {
  created_at: string
  user_id: string
  job_type?: 'SYNC' | 'SCHEDULED_SYNC'
  data?: any
  job_status?: 'STATUS_READY' | 'STATUS_LOCKED' | 'STATUS_FAILED' | 'STATUS_DONE'
  locked_time?: Date
  done_time?: Date
  retries: number
  schedule?: string
}
