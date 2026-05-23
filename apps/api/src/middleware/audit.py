from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.background import BackgroundTask
from config.database import SessionLocal
from models.audit import AuditLog
from jose import jwt
from config.settings import settings
from config.security import ALGORITHM

class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 1. Execute request
        response = await call_next(request)

        # 2. Check if request is a database modifying operation
        if request.method in ["POST", "PUT", "DELETE"]:
            # Perform audit log save in a background task to prevent blocking the HTTP response
            response.background = BackgroundTask(
                self.log_action,
                method=request.method,
                path=request.url.path,
                headers=dict(request.headers),
                client_ip=request.client.host if request.client else "Unknown"
            )
        return response

    @staticmethod
    def log_action(method: str, path: str, headers: dict, client_ip: str):
        # Extract user email from JWT token in Authorization header
        email = None
        auth_header = headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            try:
                token = auth_header.split(" ")[1]
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
                email = payload.get("sub")
            except Exception:
                pass  # Ignore invalid token parse attempts
        
        # Save audit record in DB
        db = SessionLocal()
        try:
            # Find User by email
            from models.user import User
            user = db.query(User).filter(User.email == email).first() if email else None
            user_id = user.id if user else None

            action = f"{method} {path}"
            entity_type = "API Endpoint"
            if "playbooks" in path:
                entity_type = "Playbook"
            elif "scenarios" in path:
                entity_type = "Scenario"
            elif "approvals" in path:
                entity_type = "Approval"
            elif "clients" in path:
                entity_type = "Client"
            elif "portfolios" in path:
                entity_type = "Portfolio"

            log_entry = AuditLog(
                user_id=user_id,
                action=action,
                entity_type=entity_type,
                details=f"Method: {method}, Path: {path}, Client IP: {client_ip}",
                ip_address=client_ip
            )
            db.add(log_entry)
            db.commit()
        except Exception as e:
            print(f"Failed to save audit log: {e}")
            db.rollback()
        finally:
            db.close()
