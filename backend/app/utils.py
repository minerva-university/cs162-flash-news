from datetime import datetime, timedelta, timezone
from flask_login import current_user


def check_post_24h(post):
    time_threshold = datetime.now(timezone.utc) - timedelta(hours=24)
    return post.user_id != current_user.user_id and post.posted_at < time_threshold
