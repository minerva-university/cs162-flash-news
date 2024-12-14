from flask import request
from flask_restx import Namespace, Resource
from .utils import parse_opengraph_tags, create_success_response, create_error_response

api = Namespace("opengraph", description="OpenGraph related operations")


# Scrape the URL's opengraph tags
@api.route("/")
class OpenGraph(Resource):
    def post(self):
        data = request.get_json()
        url = data["url"]

        if url is None:
            return create_error_response("No URL provided", status_code=400)

        try:
            og_data = parse_opengraph_tags(url)

            if og_data:
                return create_success_response(
                    "OpenGraph data retrieved successfully", data=og_data
                )
            else:
                return create_error_response(
                    "Invalid link or OpenGraph data", status_code=400
                )
        except Exception:
            return create_error_response(
                "Could not parse OpenGraph link", status_code=403
            )
