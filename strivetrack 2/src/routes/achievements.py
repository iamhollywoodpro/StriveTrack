from flask import Blueprint, jsonify, request
from src.models.user import User, Achievement, UserAchievement, db
from src.routes.auth import get_current_user

achievements_bp = Blueprint('achievements', __name__)

@achievements_bp.route('/', methods=['GET'])
def get_user_achievements():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Authentication required'}), 401
    
    user_achievements = UserAchievement.query.filter_by(user_id=user.id).all()
    return jsonify([ua.to_dict() for ua in user_achievements]), 200

@achievements_bp.route('/all', methods=['GET'])
def get_all_achievements():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Authentication required'}), 401
    
    achievements = Achievement.query.all()
    user_achievement_ids = [ua.achievement_id for ua in UserAchievement.query.filter_by(user_id=user.id).all()]
    
    result = []
    for achievement in achievements:
        achievement_dict = achievement.to_dict()
        achievement_dict['earned'] = achievement.id in user_achievement_ids
        if achievement.id in user_achievement_ids:
            user_achievement = UserAchievement.query.filter_by(
                user_id=user.id,
                achievement_id=achievement.id
            ).first()
            achievement_dict['earned_at'] = user_achievement.earned_at.isoformat() if user_achievement.earned_at else None
        result.append(achievement_dict)
    
    return jsonify(result), 200

def init_default_achievements():
    """Initialize default achievements if they don't exist"""
    default_achievements = [
        {
            'name': 'First Steps',
            'description': 'Create your first fitness goal',
            'icon': '🎯',
            'points': 50,
            'condition_type': 'first_habit',
            'condition_value': 1
        },
        {
            'name': 'Progress Made',
            'description': 'Complete your first goal',
            'icon': '✅',
            'points': 100,
            'condition_type': 'first_completion',
            'condition_value': 1
        },
        {
            'name': 'Picture Perfect',
            'description': 'Upload your first progress photo',
            'icon': '📸',
            'points': 75,
            'condition_type': 'first_upload',
            'condition_value': 1
        },
        {
            'name': 'Getting Consistent',
            'description': 'Maintain a 3-day streak',
            'icon': '🔥',
            'points': 200,
            'condition_type': 'streak',
            'condition_value': 3
        },
        {
            'name': 'Week Warrior',
            'description': 'Maintain a 7-day streak',
            'icon': '⚡',
            'points': 500,
            'condition_type': 'streak',
            'condition_value': 7
        },
        {
            'name': 'Well-Rounded',
            'description': 'Have active goals in 3+ categories',
            'icon': '🎨',
            'points': 300,
            'condition_type': 'categories',
            'condition_value': 3
        },
        {
            'name': 'Perfect Week',
            'description': 'Complete all goals for an entire week',
            'icon': '⭐',
            'points': 750,
            'condition_type': 'perfect_week',
            'condition_value': 1
        },
        {
            'name': 'Goal Crusher',
            'description': 'Complete 10 total goals',
            'icon': '🏆',
            'points': 1000,
            'condition_type': 'total_completions',
            'condition_value': 10
        },
        {
            'name': 'Unstoppable Force',
            'description': 'Maintain a 30-day streak',
            'icon': '💎',
            'points': 2000,
            'condition_type': 'streak',
            'condition_value': 30
        }
    ]
    
    for achievement_data in default_achievements:
        existing = Achievement.query.filter_by(name=achievement_data['name']).first()
        if not existing:
            achievement = Achievement(**achievement_data)
            db.session.add(achievement)
    
    db.session.commit()

