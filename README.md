# Text Positioning Tool

A web application that visualizes text embeddings in 1D, 2D, and 3D scatter plots using sentence transformers and UMAP dimensionality reduction.

## Features

- Input multiple texts (one per line)
- Generate embeddings using `all-MiniLM-L6-v2` model
- Visualize positions in 1D, 2D, and 3D using ECharts
- Download charts as PNG
- Export raw embedding data as JSON

## Project Structure

```
positioning-tool/
├── backend/                 # Python FastAPI backend
│   ├── Dockerfile
│   ├── requirements.txt
│   └── src/
│       └── main.py
├── frontend/                # Static frontend with Nginx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── public/
│       ├── index.html
│       ├── script.js
│       └── style.css
├── docker-compose.yml       # Production configuration
└── docker-compose.override.yml  # Development overrides
```

## Quick Start

### Using Docker Compose

```bash
# Build and run
docker compose up --build

# Access the app at http://localhost
```

### Development

The `docker-compose.override.yml` is automatically loaded and provides:
- Volume mounts for hot-reloading
- Faster healthcheck intervals

```bash
# Start in development mode
docker compose up --build

# Rebuild only backend
docker compose up --build backend
```

## Deployment

### Coolify

1. Push this repository to GitHub/GitLab
2. In Coolify, create a new service using "Docker Compose"
3. Point to your repository
4. Coolify will automatically use `docker-compose.yml`

### Manual Deployment

```bash
# Production build (ignores override file)
docker compose -f docker-compose.yml up --build -d
```

## API Endpoints

### `POST /api/process-texts/`

Process texts and return embeddings.

**Request:**
```json
{
  "texts": ["Hello world", "Another text", "More text"]
}
```

**Response:**
```json
{
  "embeddings": [[...], [...], [...]],
  "1d": [[0.5], [0.2], [0.8]],
  "2d": [[0.5, 0.3], [0.2, 0.7], [0.8, 0.1]],
  "3d": [[0.5, 0.3, 0.2], [0.2, 0.7, 0.4], [0.8, 0.1, 0.9]]
}
```

### `GET /api/health`

Health check endpoint for container orchestration.

## Tech Stack

- **Backend:** Python, FastAPI, Sentence Transformers, UMAP
- **Frontend:** Vanilla JS, ECharts, Nginx
- **Infrastructure:** Docker, Docker Compose

## License

See [LICENSE](LICENSE) file.
