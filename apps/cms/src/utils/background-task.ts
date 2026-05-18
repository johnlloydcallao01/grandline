type BackgroundTask = () => Promise<void>

export function runInBackground(taskName: string, task: BackgroundTask): void {
  setTimeout(() => {
    void task().catch((error) => {
      console.error(`${taskName} failed`, error)
    })
  }, 0)
}
