from fastapi import FastAPI
from api.router import router as api_router

app = FastAPI(title='Sentinel AI Playbook API')
app.include_router(api_router, prefix='/api')

@app.get('/')
async def root():
    return {'message': 'Welcome to Sentinel AI Playbook API'}
