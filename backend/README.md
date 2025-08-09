开发环境项目启动（在ManagementSystem目录下）
uvicorn backend.main:app --reload

(backend) sigma@sigma-MS-7D46:~/桌面/ManagementSystem$ 

tmux new-session -d -s backend ' python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000'


tmux list-sessions


tmux new-session -d -s frontend 'cd frontend && npm run dev'