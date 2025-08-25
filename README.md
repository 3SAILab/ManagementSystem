# ManagementSystem


tmux new-session -d -s backend 'source backend/.venv/bin/activate &&  python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000'


tmux list-sessions


tmux new-session -d -s frontend 'cd frontend && npm run dev'

# TestSystem

tmux new-session -d -s backendtest 'source backend/.venv/bin/activate &&  python -m uvicorn backend.main:app --host 0.0.0.0 --port 8001'


tmux list-sessions


tmux new-session -d -s frontendtest 'cd frontend && npm run dev'

# 数据库备份

pg_dump -h localhost -U myuser -d mydb > backup.sql

pg_dump -h localhost -U user -d mydb > backup_$(date +%Y%m%d_%H%M%S).sql