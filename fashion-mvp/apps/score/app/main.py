# apps/score/app/main.py
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class OutfitItem(BaseModel):
    product_id: int
    color_hex: str | None = None
    style: str | None = None
    category: str | None = None

class OutfitPayload(BaseModel):
    items: list[OutfitItem]

@app.get("/score/health")
async def health():
    return {"ok": True}

@app.post("/score")
async def score(payload: OutfitPayload):
    total = 75
    breakdown = {"color": 30, "style": 25, "occasion": 20}
    messages = ["+ monocromía", "- calzado formal con jogger"]
    return {"total": total, "breakdown": breakdown, "messages": messages}
