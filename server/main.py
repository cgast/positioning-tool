from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import umap
import numpy as np
from fastapi.middleware.cors import CORSMiddleware

import os

api_prefix = os.environ.get("API_PREFIX", "")

app = FastAPI(root_path=api_prefix)

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Texts(BaseModel):
    texts: list[str]

model = SentenceTransformer('all-MiniLM-L6-v2')

@app.post("/process-texts/")
async def process_texts(texts: Texts):
    if not texts.texts:
        raise HTTPException(status_code=400, detail="Input texts cannot be empty.")

    embeddings = model.encode(texts.texts)

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
