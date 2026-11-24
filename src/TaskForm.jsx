import { useEffect, useRef, useState } from 'react'
import { taskStatuses } from './taskStatuses.js'

export default function TaskForm({ task, pending, onSave, onCancel }) {
  const titleInput = useRef(null)
  const [error, setError] = useState('')

  useEffect(() => {
    titleInput.current.focus()
  }, [])

  function handleSubmit(event) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    const title = fields.get('title').trim()

    if (!title) {
      setError('Enter a task title.')
      titleInput.current.focus()
      return
    }

    setError('')
    onSave({
      title,
      description: fields.get('description').trim(),
      status: fields.get('status'),
    })
  }

  return (
    <form className="task-form" onSubmit={handleSubmit} aria-label={task ? 'Edit task' : 'New task'}>
      <h2>{task ? 'Edit task' : 'New task'}</h2>
      <label className="field">
        <span>Title</span>
        <input
          ref={titleInput}
          name="title"
          defaultValue={task?.title}
          maxLength={160}
          disabled={pending}
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'task-title-error' : undefined}
          placeholder="What needs doing?"
          onChange={() => setError('')}
        />
      </label>
      {error && <p className="field-error" id="task-title-error" role="alert">{error}</p>}
      <label className="field">
        <span>Description <span className="optional">(optional)</span></span>
        <textarea name="description" defaultValue={task?.description} maxLength={2000} rows={3} disabled={pending} />
      </label>
      <div className="field status-field">
        <label htmlFor="task-status">Status</label>
        <select id="task-status" name="status" defaultValue={task?.status ?? 'todo'} disabled={pending}>
          {Object.entries(taskStatuses).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
      <div className="form-actions">
        <button className="button secondary" type="button" onClick={onCancel} disabled={pending}>Cancel</button>
        <button className="button primary" disabled={pending}>
          {pending ? 'Saving…' : task ? 'Save changes' : 'Create task'}
        </button>
      </div>
    </form>
  )
}
