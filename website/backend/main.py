from fastapi import FastAPI
from src.middleware.cors import add_cors
from src.routes import hotspots, visual

app = FastAPI(
    title="Parking-Induced Congestion API",
    description="ASTraM ParkInsight backend -- Flipkart Gridlock Hackathon 2.0",
    version="2.0.0"
)

add_cors(app)

app.include_router(hotspots.router, prefix="/api")
app.include_router(visual.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
