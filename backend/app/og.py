from flask import Blueprint, request, jsonify
from .utils import parse_opengraph_tags

opengraph_bp = Blueprint("opengraph", __name__)


# Scrape the URL's opengraph tags
@opengraph_bp.route("/url", methods=["POST"])
def scrape():
    data = request.get_json()
    url = data["url"]

    if url is None:
        return (jsonify({"error": "No URL provided"}), 400)

    og_data = parse_opengraph_tags(url)

    if og_data:
        return (jsonify(og_data), 200)
    else:
        return (jsonify({"error": "Invalid link or OpenGraph data"}), 400)
