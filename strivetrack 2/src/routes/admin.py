from flask import Blueprint, jsonify, request, send_file
from src.models.user import User, Habit, Media, Achievement, UserAchievement, db
from src.routes.auth import get_current_user
import os

admin_bp = Blueprint('admin', __name__)

def require_admin():
    """Decorator to require admin access"""
    user = get_current_user()
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    return user

@admin_bp.route('/stats', methods=['GET'])
def get_admin_stats():
    user = require_admin()
    if isinstance(user, tuple):  # Error response
        return user
    
    total_users = User.query.count()
    total_media = Media.query.count()
    total_habits = Habit.query.count()
    flagged_media = Media.query.filter_by(flagged=True).count()
    
    return jsonify({
        'totalUsers': total_users,
        'totalMedia': total_media,
        'totalHabits': total_habits,
        'flaggedMedia': flagged_media
    }), 200

@admin_bp.route('/users', methods=['GET'])
def get_admin_users():
    user = require_admin()
    if isinstance(user, tuple):  # Error response
        return user
    
    users = User.query.all()
    users_data = []
    
    for u in users:
        user_dict = u.to_dict()
        user_dict['habitCount'] = Habit.query.filter_by(user_id=u.id).count()
        user_dict['mediaCount'] = Media.query.filter_by(user_id=u.id).count()
        users_data.append(user_dict)
    
    return jsonify(users_data), 200

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_admin_user(user_id):
    admin_user = require_admin()
    if isinstance(admin_user, tuple):  # Error response
        return admin_user
    
    user = User.query.get_or_404(user_id)
    
    # Don't allow deleting admin users
    if user.role == 'admin':
        return jsonify({'error': 'Cannot delete admin users'}), 400
    
    # Delete user's media files from disk
    media_items = Media.query.filter_by(user_id=user.id).all()
    for media in media_items:
        if os.path.exists(media.file_path):
            os.remove(media.file_path)
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({'message': 'User deleted successfully'}), 200

@admin_bp.route('/media', methods=['GET'])
def get_admin_media():
    user = require_admin()
    if isinstance(user, tuple):  # Error response
        return user
    
    media_items = Media.query.join(User).order_by(Media.upload_date.desc()).all()
    media_data = []
    
    for media in media_items:
        media_dict = media.to_dict()
        media_dict['userEmail'] = media.user.email
        media_data.append(media_dict)
    
    return jsonify(media_data), 200

@admin_bp.route('/media/<int:media_id>/view', methods=['GET'])
def view_admin_media(media_id):
    user = require_admin()
    if isinstance(user, tuple):  # Error response
        return user
    
    media = Media.query.get_or_404(media_id)
    
    if not os.path.exists(media.file_path):
        return jsonify({'error': 'File not found on disk'}), 404
    
    return send_file(media.file_path, mimetype=media.mime_type)

@admin_bp.route('/media/<int:media_id>/download', methods=['GET'])
def download_admin_media(media_id):
    user = require_admin()
    if isinstance(user, tuple):  # Error response
        return user
    
    media = Media.query.get_or_404(media_id)
    
    if not os.path.exists(media.file_path):
        return jsonify({'error': 'File not found on disk'}), 404
    
    return send_file(
        media.file_path,
        as_attachment=True,
        download_name=media.original_filename,
        mimetype=media.mime_type
    )

@admin_bp.route('/media/<int:media_id>', methods=['DELETE'])
def delete_admin_media(media_id):
    user = require_admin()
    if isinstance(user, tuple):  # Error response
        return user
    
    media = Media.query.get_or_404(media_id)
    
    # Delete file from disk
    if os.path.exists(media.file_path):
        os.remove(media.file_path)
    
    # Delete from database
    db.session.delete(media)
    db.session.commit()
    
    return jsonify({'message': 'Media deleted successfully'}), 200

@admin_bp.route('/media/<int:media_id>/flag', methods=['POST'])
def toggle_media_flag(media_id):
    user = require_admin()
    if isinstance(user, tuple):  # Error response
        return user
    
    media = Media.query.get_or_404(media_id)
    media.flagged = not media.flagged
    db.session.commit()
    
    return jsonify({
        'flagged': media.flagged,
        'message': f'Media {"flagged" if media.flagged else "unflagged"} successfully'
    }), 200

