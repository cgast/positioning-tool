import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import umap

api_prefix = os.environ.get("API_PREFIX", "")

app = FastAPI(
    title="Text Positioning API",
    description="API for generating text embeddings and dimensionality reduction",
    version="1.0.0",
    root_path=api_prefix
)

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TextsRequest(BaseModel):
    texts: list[str]


# Load model at startup
model = SentenceTransformer('all-MiniLM-L6-v2')


@app.get("/health")
async def health_check():
    """Health check endpoint for container orchestration."""
    return {"status": "healthy"}


@app.post("/process-texts/")
async def process_texts(request: TextsRequest):
    """
    Process a list of texts and return embeddings in multiple dimensions.

    Returns:
        - embeddings: Full sentence embeddings
        - 1d: 1-dimensional projection
        - 2d: 2-dimensional projection (UMAP)
        - 3d: 3-dimensional projection (UMAP)
    """
    if not request.texts:
        raise HTTPException(status_code=400, detail="Input texts cannot be empty.")

    embeddings = model.encode(request.texts)

    reducer = umap.UMAP(n_components=3)
    embedding_3d = reducer.fit_transform(embeddings)

    embedding_1d = embedding_3d[:, :1]
    embedding_2d = embedding_3d[:, :2]

    return {
        "embeddings": embeddings.tolist(),
        "1d": embedding_1d.tolist(),
        "2d": embedding_2d.tolist(),
        "3d": embedding_3d.tolist(),
    }
