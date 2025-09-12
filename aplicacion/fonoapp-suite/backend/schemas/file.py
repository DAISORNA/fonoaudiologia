from pydantic import BaseModel

class MediaFileOut(BaseModel):
    id: int
    path: str
    kind: str
    class Config: orm_mode = True
