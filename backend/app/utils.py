import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import get_jwt_identity
from flask import jsonify, make_response


def check_post_24h(post):
    time_threshold = datetime.now(timezone.utc) - timedelta(hours=24)

    # Remove the timezone because SQLite datetime isn't timezone-aware
    time_threshold_naive = time_threshold.replace(tzinfo=None)

    return (
        post.user_id != int(get_jwt_identity())
        and post.posted_at < time_threshold_naive
    )


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
    """
    Create a standardized JSON response for successful operations.

    Args:
        message (str): A message describing the success.
        status_code (int, optional): HTTP status code for the response. Defaults to 200.
        data (dict, optional): Additional data to include in the response. Defaults to None.

    Returns:
        tuple: A tuple containing a JSON response (dict) and the HTTP status code (int).
    """
    response = {"status": "success", "message": message, "data": data}
    return make_response(
        response,
        status_code,
    )


# Utility function for consistent error handling
def create_error_response(message, status_code=400, details=None):
    """
    Create a standardized JSON response for error cases.

    Args:
        message (str): A message describing the error.
        status_code (int, optional): HTTP status code for the response. Defaults to 400.
        details (dict, optional): Additional details about the error. Defaults to None.

    Returns:
        tuple: A tuple containing a JSON response (dict) and the HTTP status code (int).
    """
    response = {"status": "error", "message": message, "details": details}
    return make_response(
        response,
        status_code,
    )
