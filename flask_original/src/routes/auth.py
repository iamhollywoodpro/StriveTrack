from flask import Blueprint, jsonify, request
from src.models.user import User, Session, db
from datetime import datetime, timedelta
import uuid

auth_bp = Blueprint('auth', __name__)

def get_current_user():
    """Helper function to get current user from session"""
    session_id = request.headers.get('x-session-id')
    if not session_id:
        return None
    
    session = Session.query.filter_by(id=session_id).first()
    if not session or not session.is_valid():
        return None
    
    return session.user

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    
    user = User(email=email)
    user.set_password(password)
    
    # Set admin role for specific email
    if email == 'iamhollywoodpro@protonmail.com':
        user.role = 'admin'
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Create session
    session = Session(
        user_id=user.id,
        expires_at=datetime.utcnow() + timedelta(days=30)
    )
    db.session.add(session)
    db.session.commit()
    
    return jsonify({
        'sessionId': session.id,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/validate-session', methods=['GET'])
def validate_session():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Invalid session'}), 401
    
    return jsonify({'user': user.to_dict()}), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session_id = request.headers.get('x-session-id')
    if session_id:
        session = Session.query.filter_by(id=session_id).first()
        if session:
            db.session.delete(session)
            db.session.commit()
    
    return jsonify({'message': 'Logged out successfully'}), 200

