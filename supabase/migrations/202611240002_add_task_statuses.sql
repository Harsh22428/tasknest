alter table public.tasks
  drop constraint tasks_status_check,
  add constraint tasks_status_check check (status in ('backlog', 'todo', 'ongoing', 'done'));
