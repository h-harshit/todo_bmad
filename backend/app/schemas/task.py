from pydantic import BaseModel, ConfigDict
from datetime import datetime

class TaskCreate(BaseModel):
    title: str

class TaskUpdate(BaseModel):
    title: str

class TaskStatusUpdate(BaseModel):
    status: str

class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    status: str
    user_id: str
    created_at: datetime
    updated_at: datetime
