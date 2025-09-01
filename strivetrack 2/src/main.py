import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.habits import habits_bp
from src.routes.media import media_bp
from src.routes.achievements import achievements_bp
from src.routes.admin import admin_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Enable CORS for all routes
CORS(app, origins="*")

# Register blueprints
app.register_blueprint(user_bp, url_prefix='/api/users')
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(habits_bp, url_prefix='/api/habits')
app.register_blueprint(media_bp, url_prefix='/api/media')
app.register_blueprint(achievements_bp, url_prefix='/api/achievements')
app.register_blueprint(admin_bp, url_prefix='/api/admin')

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size

db.init_app(app)

with app.app_context():
    db.create_all()
    
    # Initialize default achievements
    from src.routes.achievements import init_default_achievements
    init_default_achievements()
    
    # Create admin user if it doesn't exist
    from src.models.user import User
    admin_email = 'iamhollywoodpro@protonmail.com'
    try:
        admin_user = User.query.filter_by(email=admin_email).first()
        if not admin_user:
            admin_user = User(email=admin_email, role='admin')
            admin_user.set_password('password123')
            db.session.add(admin_user)
            db.session.commit()
            print(f"Created admin user: {admin_email}")
    except Exception as e:
        print(f"Error creating admin user: {e}")
        # If there's an error, recreate the database
        db.drop_all()
        db.create_all()
        init_default_achievements()
        admin_user = User(email=admin_email, role='admin')
        admin_user.set_password('password123')
        db.session.add(admin_user)
        db.session.commit()
        print(f"Recreated database and created admin user: {admin_email}")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

