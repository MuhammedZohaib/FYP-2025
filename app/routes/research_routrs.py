import random
import time
from fastapi import APIRouter, HTTPException
from semanticscholar import SemanticScholar

router = APIRouter()

sch = SemanticScholar()

# Predefined ASD-related search queries
asd_queries = [
    "Autism Spectrum Disorder",
    "Early ASD Detection",
    "Machine Learning in Autism Diagnosis",
    "Speech and Facial Cues in Autism",
    "Neural Networks for ASD Prediction"
]

@router.get("/latest-research")
async def get_latest_research():
    try:
        time.sleep(random.randint(1, 5))
        query = random.choice(asd_queries)
        papers = sch.search_paper(
            query,
            limit=100,
            year=2025,
            open_access_pdf=True,
        )
        
        results = []
        count = 0
        for paper in papers:
            results.append({
                "title": getattr(paper, "title", ""),
                "abstract": getattr(paper, "abstract", ""),
                "authors": [author.name for author in getattr(paper, "authors", [])],
                "year": getattr(paper, "year", None),
                "venue": getattr(paper, "venue", ""),
                "url": getattr(paper, "url", ""),
                "pdf_url": getattr(paper, "openAccessPdf", {}).get("url", "None")
            })
            count += 1
            if count >= 10:
                break
        
        return {"query_used": query, "papers": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
