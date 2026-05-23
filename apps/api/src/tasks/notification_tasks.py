from tasks.celery_worker import celery_app
from config.database import SessionLocal
from models.communication import Communication

@celery_app.task(name="tasks.send_advisory_email")
def send_advisory_email(communication_id: int):
    db = SessionLocal()
    try:
        comm = db.query(Communication).filter(Communication.id == communication_id).first()
        if not comm:
            return f"Communication {communication_id} not found."
            
        print(f"Sending advisory email via {comm.channel} to {comm.recipient}...")
        # Simulate SMTP delay
        import time
        time.sleep(2)
        
        # Update status
        comm.status = "Sent"
        from datetime import datetime
        comm.sent_at = datetime.utcnow()
        db.commit()
        return f"Successfully sent advisory notice to {comm.recipient}."
    except Exception as e:
        db.rollback()
        return f"Failed to send: {str(e)}"
    finally:
        db.close()
