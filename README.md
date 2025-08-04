# ManagementSystem


tmux new-session -d -s backend ' python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000'


tmux list-sessions


tmux new-session -d -s frontend 'cd frontend && npm run dev'

# TestSystem

tmux new-session -d -s backendtest ' python -m uvicorn backend.main:app --host 0.0.0.0 --port 8001'


tmux list-sessions


tmux new-session -d -s frontendtest 'cd frontend && npm run dev'