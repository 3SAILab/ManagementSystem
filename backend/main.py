from fastapi import FastAPI
import uvicorn
from backend.api.api import api_router

app = FastAPI()

app.include_router(api_router)


if __name__ == "__main__":
    # 获取端口，默认为 8000
    
    # 启动服务器
    uvicorn.run(app, host="0.0.0.0", port=8000) 



