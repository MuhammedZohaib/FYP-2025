import random
import time
from socket import timeout
from fastapi import APIRouter, HTTPException
from semanticscholar import SemanticScholar

router = APIRouter()

sch = SemanticScholar(timeout=10)

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
        # Introduce a random delay (1 to 5 seconds)
        time.sleep(random.randint(1, 5))
        
        # Choose a random ASD-related search query
        query = random.choice(asd_queries)

        # Fetch research papers
        papers = sch.search_paper(
            query,
            limit=1,
            year=2025,
            open_access_pdf=True
        )
        
        results = []
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
        
        return {"query_used": query, "papers": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
