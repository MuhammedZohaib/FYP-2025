from fastapi import APIRouter

from .doctor_routes import router as doctor_router
from .patient_routes import router as patient_router
from .upload_routes import router as upload_router
from .dashboard_routes import router as dashboard_router
from .email_routes import router as email_router
from .news_routes import router as news_router
from .research_routes import router as reasearch_router

router = APIRouter()

router.include_router(doctor_router)
router.include_router(patient_router)
router.include_router(upload_router)
router.include_router(dashboard_router)
router.include_router(email_router)
router.include_router(news_router)
router.include_router(reasearch_router)

@router.get('/')
async def test():
    return {'detail': 'Hello World'}

