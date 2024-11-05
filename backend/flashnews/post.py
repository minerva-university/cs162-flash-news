from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from . import db
from .models import Post

posts = Blueprint("post", __name__)

# Create a post
@posts.route("/posts", methods=["POST"])
@login_required

# Get all posts (posted by the user)
@posts.route("/posts", methods=["GET"])

# Get a single post
@posts.route("/posts/<post_id>", methods=["GET"])

# Delete a post
@posts.route("/posts/<post_id>", methods=["DELETE"])

# Update a post
@posts.route("/posts/<post_id>", methods=["PUT"])

# Like a post
@posts.route("/posts/<post_id>/like", methods=["POST"])

# Comment on a post
@posts.route("/posts/<post_id>/comment", methods=["POST"])



