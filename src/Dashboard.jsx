import { useEffect, useState } from 'react'
import { Check, ClipboardList, LogOut, Pencil, Plus, Trash2 } from 'lucide-react'
import Brand from './Brand.jsx'
import TaskForm from './TaskForm.jsx'
import { supabase } from './supabase.js'

const taskFields = 'id, title, description, status'
const filters = [['all', 'All'], ['todo', 'To do'], ['done', 'Done']]

export default function Dashboard({ user }) {
  const [tasks, setTasks] = useState(null)
  const [filter, setFilter] = useState('all')
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [loadError, setLoadError] = useState(false)
  const [actionError, setActionError] = useState('')
  const [editor, setEditor] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    const request = new AbortController()

    async function loadTasks() {
      try {
        const { data, error } = await supabase.from('tasks')
          .select(taskFields)
          .order('created_at', { ascending: false })
          .order('id', { ascending: false })
          .abortSignal(request.signal)

        if (request.signal.aborted) return
        if (error) throw error
        setTasks(data)
      } catch {
        if (!request.signal.aborted) setLoadError(true)
      }
    }

    loadTasks()
    return () => request.abort()
  }, [loadAttempt])

  const completed = tasks?.filter((task) => task.status === 'done').length ?? 0
  const counts = { all: tasks?.length ?? 0, todo: (tasks?.length ?? 0) - completed, done: completed }
  const visible = tasks?.filter((task) => filter === 'all' || task.status === filter)

  function openEditor(task) {
    setActionError('')
    setDeleting(null)
    setEditor({ task })
  }

  async function runAction(action, message) {
    setPending(true)
    setActionError('')
    try {
      await action()
    } catch {
      setActionError(message)
    } finally {
      setPending(false)
    }
  }

  function saveTask(values) {
    const task = editor.task
    return runAction(async () => {
      const table = supabase.from('tasks')
      const request = task ? table.update(values).eq('id', task.id) : table.insert(values)
      const { data, error } = await request.select(taskFields).single()
      if (error) throw error

      setTasks((current) => task
        ? current.map((item) => item.id === task.id ? data : item)
        : [data, ...current])
      setEditor(null)
      if (!task) setFilter('all')
    }, 'Couldn’t save this task. Your changes are still in the form. Try again.')
  }

  function toggleTask(task) {
    const status = task.status === 'done' ? 'todo' : 'done'
    return runAction(async () => {
      const { data, error } = await supabase.from('tasks')
        .update({ status }).eq('id', task.id).select(taskFields).single()
      if (error) throw error
      setTasks((current) => current.map((item) => item.id === task.id ? data : item))
    }, 'Couldn’t change the status. Try again.')
  }

  function deleteTask(task) {
    return runAction(async () => {
      const { error } = await supabase.from('tasks')
        .delete().eq('id', task.id).select('id').maybeSingle()
      if (error) throw error
      setTasks((current) => current.filter((item) => item.id !== task.id))
      setDeleting(null)
    }, 'Couldn’t delete this task. Try again.')
  }

  function signOut() {
    return runAction(async () => {
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      if (error) throw error
    }, 'Couldn’t sign out. Try again.')
  }

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Brand />
          <div className="account">
            <span className="account-email" title={user.email}>{user.email}</span>
            <button className="button secondary signout-button" onClick={signOut} disabled={pending}>
              <LogOut size={16} aria-hidden="true" /> Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="dashboard">
        <div className="dashboard-heading">
          <h1>My tasks</h1>
          <button className="button primary" onClick={() => openEditor(null)} disabled={!tasks || pending || !!editor}>
            <Plus size={19} aria-hidden="true" /> Add task
          </button>
        </div>
        {tasks?.length > 0 && (
          <div className="progress-summary">
            <progress value={completed} max={tasks.length} aria-label="Task completion" />
            <span>{completed} of {tasks.length} complete</span>
          </div>
        )}
        {editor && <TaskForm task={editor.task} pending={pending} onSave={saveTask} onCancel={() => setEditor(null)} />}
        {actionError && <p className="notice error" role="alert">{actionError}</p>}

        {loadError && (
          <div className="empty-state">
            <h2>Couldn’t load your tasks</h2>
            <p className="muted">Check your connection and try again.</p>
            <button className="button secondary" onClick={() => {
              setLoadError(false)
              setLoadAttempt((attempt) => attempt + 1)
            }}>Try again</button>
          </div>
        )}
        {!tasks && !loadError && <p className="list-loading" role="status">Loading tasks…</p>}
        {tasks && (
          <section aria-label="Task list">
            <div className="filter-bar" role="group" aria-label="Filter tasks by status">
              {filters.map(([value, label]) => (
                <button
                  className="filter-button"
                  key={value}
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                  disabled={pending}
                >
                  {label} <span>{counts[value]}</span>
                </button>
              ))}
            </div>
            {visible.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon"><ClipboardList size={25} aria-hidden="true" /></span>
                <h2>{filter === 'all' ? 'No tasks yet' : filter === 'done' ? 'No completed tasks' : 'Nothing left to do'}</h2>
                <p className="muted">
                  {filter === 'all'
                    ? 'Add your first task to get started.'
                    : filter === 'done'
                      ? 'Tasks appear here when you mark them done.'
                      : 'New tasks will appear here as you add them.'}
                </p>
              </div>
            ) : (
              <ul className="task-list">
                {visible.map((task) => (
                  <li key={task.id} className="task-item">
                    <div className="task-row">
                      <button
                        className="task-check"
                        aria-pressed={task.status === 'done'}
                        aria-label={'Toggle completion for ' + task.title}
                        onClick={() => toggleTask(task)}
                        disabled={pending || !!editor || !!deleting}
                      >
                        {task.status === 'done' && <Check size={15} aria-hidden="true" />}
                      </button>
                      <div className="task-text">
                        <h2>{task.title}</h2>
                        {task.description && <p>{task.description}</p>}
                      </div>
                      <span className={'status-pill ' + task.status}>{task.status === 'done' ? 'Done' : 'To do'}</span>
                      <div className="task-actions">
                        <button
                          className="icon-button"
                          aria-label={'Edit ' + task.title}
                          title="Edit task"
                          onClick={() => openEditor(task)}
                          disabled={pending || !!editor}
                        ><Pencil size={17} aria-hidden="true" /></button>
                        <button
                          className="icon-button delete-icon"
                          aria-label={'Delete ' + task.title}
                          title="Delete task"
                          onClick={() => {
                            setActionError('')
                            setDeleting(task.id)
                          }}
                          disabled={pending || !!editor}
                        ><Trash2 size={17} aria-hidden="true" /></button>
                      </div>
                    </div>
                    {deleting === task.id && (
                      <div className="delete-confirmation">
                        <p>Delete this task? This can’t be undone.</p>
                        <div className="form-actions">
                          <button className="button secondary" onClick={() => setDeleting(null)} disabled={pending}>Cancel</button>
                          <button className="button destructive" onClick={() => deleteTask(task)} disabled={pending}>
                            {pending ? 'Deleting…' : 'Delete task'}
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>
    </>
  )
}
