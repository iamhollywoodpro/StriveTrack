from flask import Blueprint, jsonify, request, send_file
from src.models.user import User, Media, db
from src.routes.auth import get_current_user
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime

media_bp = Blueprint('media', __name__)

UPLOAD_FOLDER = '/home/ubuntu/strivetrack/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'mp4', 'mov', 'avi', 'mkv'}

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@media_bp.route('/upload', methods=['POST'])
def upload_media():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Authentication required'}), 401
    
    if 'media' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['media']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
    
    # Generate unique filename
    file_extension = file.filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
    
    try:
        file.save(file_path)
        file_size = os.path.getsize(file_path)
        
        # Save to database
        media = Media(
            user_id=user.id,
            filename=unique_filename,
            original_filename=secure_filename(file.filename),
            file_path=file_path,
            file_size=file_size,
            mime_type=file.content_type or 'application/octet-stream'
        )
        
        db.session.add(media)
        db.session.commit()
        
        # Check for achievements
        from src.routes.habits import check_achievements
        check_achievements(user)
        
        return jsonify(media.to_dict()), 201
        
    except Exception as e:
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@media_bp.route('/', methods=['GET'])
def get_media():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Authentication required'}), 401
    
    media_items = Media.query.filter_by(user_id=user.id).order_by(Media.upload_date.desc()).all()
    return jsonify([item.to_dict() for item in media_items]), 200

@media_bp.route('/<int:media_id>/view', methods=['GET'])
def view_media(media_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Authentication required'}), 401
    
    media = Media.query.filter_by(id=media_id, user_id=user.id).first()
    if not media:
        return jsonify({'error': 'Media not found'}), 404
    
    if not os.path.exists(media.file_path):
        return jsonify({'error': 'File not found on disk'}), 404
    
    return send_file(media.file_path, mimetype=media.mime_type)

@media_bp.route('/<int:media_id>/download', methods=['GET'])
def download_media(media_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Authentication required'}), 401
    
    media = Media.query.filter_by(id=media_id, user_id=user.id).first()
    if not media:
        return jsonify({'error': 'Media not found'}), 404
    
    if not os.path.exists(media.file_path):
        return jsonify({'error': 'File not found on disk'}), 404
    
    return send_file(
        media.file_path,
        as_attachment=True,
        download_name=media.original_filename,
        mimetype=media.mime_type
    )

@media_bp.route('/<int:media_id>', methods=['DELETE'])
def delete_media(media_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Authentication required'}), 401
    
    media = Media.query.filter_by(id=media_id, user_id=user.id).first()
    if not media:
        return jsonify({'error': 'Media not found'}), 404
    
    # Delete file from disk
    if os.path.exists(media.file_path):
        os.remove(media.file_path)
    
    # Delete from database
    db.session.delete(media)
    db.session.commit()
    
    return jsonify({'message': 'Media deleted successfully'}), 200

