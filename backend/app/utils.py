import requests
from bs4 import BeautifulSoup

from datetime import datetime, timedelta, timezone
from flask_login import current_user


def check_post_24h(post):
    time_threshold = datetime.now(timezone.utc) - timedelta(hours=24)
    return post.user_id != current_user.user_id and post.posted_at < time_threshold


# ChatGPT-generated function to parse OpenGraph tags from HTML content
def parse_opengraph_tags(url):
    """
    Fetch HTML content from the given URL, then extract OpenGraph tags from
    the HTML content.

    Args:
        html_content (str): The HTML content as a string.

    Returns:
        dict: A dictionary containing the OpenGraph tags and their values.
    """
    # Fetch the HTML content of the page
    response = requests.get(url)
    response.raise_for_status()  # Raise an error for bad responses (4xx or 5xx)

    # Parse HTML with BeautifulSoup
    soup = BeautifulSoup(response.text, "html.parser")
    og_tags = {}

    # Find all meta tags with the property attribute starting with "og:"
    for tag in soup.find_all("meta", attrs={"property": True}):
        if tag["property"].startswith("og:"):
            og_tags[tag["property"].replace("og:", "")] = tag.get("content", "")

    return og_tags



# Utility function for consistent success handling
def create_success_response(message, status_code=200, data=None):
    return jsonify({
        'status': 'success',
        'message': message,
        'data': data
    }), status_code

# Utility function for consistent error handling
def create_error_response(message, status_code=400, details=None):
    return jsonify({
        'status': 'error',
        'message': message,
        'details': details
    }), status_code