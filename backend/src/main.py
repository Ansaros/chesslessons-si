from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.core.dependencies import get_config
from src.routers.all import router as all_routes
from src.core.logger import logger, setup_logging, logging

setup_logging()
logger.info(f"✅ Logging initialized. Effective level: {logging.getLevelName(logger.getEffectiveLevel())}")

app = FastAPI(
    title="Chess Video Platform",
    version="1.0.0",
    debug=get_config().DEBUG,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_config().ALLOWED_HOSTS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(all_routes)