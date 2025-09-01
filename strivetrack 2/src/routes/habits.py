from flask import Blueprint, jsonify, request
from src.models.user import User, Habit, HabitCompletion, db
from src.routes.auth import get_current_user
from datetime import datetime, date

habits_bp = Blueprint('habits', __name__)

@habits_bp.route('/', methods=['GET'])
def get_habits():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Authentication required'}), 401
    
    habits = Habit.query.filter_by(user_id=user.id).all()
    habits_data = []
    
    for habit in habits:
        habit_dict = habit.to_dict()
        # Add completion data for today
        today = date.today()
        completion = HabitCompletion.query.filter_by(
            habit_id=habit.id,
            completion_date=today
        ).first()
        habit_dict['completed_today'] = completion is not None
        
        # Add weekly completion data
        from datetime import timedelta
        week_start = today - timedelta(days=today.weekday())
        week_completions = []
        
        for i in range(7):
            check_date = week_start + timedelta(days=i)
            completion = HabitCompletion.query.filter_by(
                habit_id=habit.id,
                date=check_date
            ).first()
            week_completions.append({
                'date': check_date.isoformat(),
                'completed': completion is not None
            })
        
        habit_dict['week_completions'] = week_completions
        habits_data.append(habit_dict)
    
    return jsonify(habits_data), 200

@habits_bp.route('/', methods=['POST'])
def create_habit():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Authentication required'}), 401
    
    data = request.json
    name = data.get('name')
    description = data.get('description', '')
    category = data.get('category', 'general')
    difficulty = data.get('difficulty', 'medium')
    
    if not name:
        return jsonify({'error': 'Habit name is required'}), 400
    
    habit = Habit(
        user_id=user.id,
        name=name,
        description=description,
        category=category,
        difficulty=difficulty
    )
    
    db.session.add(habit)
    db.session.commit()
    
    return jsonify(habit.to_dict()), 201

@habits_bp.route('/<int:habit_id>/toggle', methods=['POST'])
def toggle_habit_completion(habit_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Authentication required'}), 401
    
    habit = Habit.query.filter_by(id=habit_id, user_id=user.id).first()
    if not habit:
        return jsonify({'error': 'Habit not found'}), 404
    
    today = date.today()
    completion = HabitCompletion.query.filter_by(
        habit_id=habit.id,
        date=today
    ).first()
    
    if completion:
        # Remove completion
        db.session.delete(completion)
        completed = False
    else:
        # Add completion
        completion = HabitCompletion(
            habit_id=habit.id,
            completion_date=today
        )
        db.session.add(completion)
        completed = True
        
        # Award points
        points_map = {'easy': 10, 'medium': 20, 'hard': 30}
        points = points_map.get(habit.difficulty, 20)
        user.points += points
    
    db.session.commit()
    
    # Check for achievements
    check_achievements(user)
    
    return jsonify({
        'completed': completed,
        'points_earned': points if completed else 0
    }), 200

@habits_bp.route('/<int:habit_id>', methods=['DELETE'])
def delete_habit(habit_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Authentication required'}), 401
    
    habit = Habit.query.filter_by(id=habit_id, user_id=user.id).first()
    if not habit:
        return jsonify({'error': 'Habit not found'}), 404
    
    db.session.delete(habit)
    db.session.commit()
    
    return jsonify({'message': 'Habit deleted successfully'}), 200

@habits_bp.route('/<int:habit_id>/history', methods=['GET'])
def get_habit_history(habit_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Authentication required'}), 401
    
    habit = Habit.query.filter_by(id=habit_id, user_id=user.id).first()
    if not habit:
        return jsonify({'error': 'Habit not found'}), 404
    
    completions = HabitCompletion.query.filter_by(habit_id=habit.id).order_by(HabitCompletion.date.desc()).all()
    
    history = [{
        'date': completion.date.isoformat(),
        'completed_at': completion.completed_at.isoformat()
    } for completion in completions]
    
    return jsonify(history), 200

def check_achievements(user):
    """Check and award achievements for user"""
    from src.models.user import Achievement, UserAchievement
    
    # Get all achievements
    achievements = Achievement.query.all()
    
    for achievement in achievements:
        # Check if user already has this achievement
        existing = UserAchievement.query.filter_by(
            user_id=user.id,
            achievement_id=achievement.id
        ).first()
        
        if existing:
            continue
        
        # Check achievement conditions
        earned = False
        
        if achievement.condition_type == 'first_habit':
            habit_count = Habit.query.filter_by(user_id=user.id).count()
            earned = habit_count >= achievement.condition_value
        
        elif achievement.condition_type == 'first_completion':
            completion_count = HabitCompletion.query.join(Habit).filter(
                Habit.user_id == user.id
            ).count()
            earned = completion_count >= achievement.condition_value
        
        elif achievement.condition_type == 'streak':
            # Check for any habit with required streak
            habits = Habit.query.filter_by(user_id=user.id).all()
            for habit in habits:
                if habit.get_current_streak() >= achievement.condition_value:
                    earned = True
                    break
        
        elif achievement.condition_type == 'total_completions':
            completion_count = HabitCompletion.query.join(Habit).filter(
                Habit.user_id == user.id
            ).count()
            earned = completion_count >= achievement.condition_value
        
        elif achievement.condition_type == 'first_upload':
            from src.models.user import Media
            media_count = Media.query.filter_by(user_id=user.id).count()
            earned = media_count >= achievement.condition_value
        
        if earned:
            user_achievement = UserAchievement(
                user_id=user.id,
                achievement_id=achievement.id
            )
            db.session.add(user_achievement)
            user.points += achievement.points
    
    db.session.commit()

