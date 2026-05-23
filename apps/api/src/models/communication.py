from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from config.database import Base

class Communication(Base):
    __tablename__ = "communications"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False)
    channel = Column(String(30), nullable=False)  # e.g., Email, SMS, Portal
    recipient = Column(String(100), nullable=False)
    subject = Column(String(200), nullable=True)
    content = Column(Text, nullable=False)
    status = Column(String(30), nullable=False, default="Draft")  # Draft, Sent, Failed
    sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    workflow = relationship("Workflow", back_populates="communications")
