import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import get_jwt_identity


def check_post_24h(post):
    time_threshold = datetime.now(timezone.utc) - timedelta(hours=24)
    return post.user_id != get_jwt_identity() and post.posted_at < time_threshold


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
