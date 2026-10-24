from flask import Flask, jsonify, render_template, request

from recommender import CourseRecommender

app = Flask(__name__)
engine = CourseRecommender()  # trains once at start-up (takes about a second)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/courses")
def courses():
    return jsonify(engine.catalog())


@app.route("/api/recommend", methods=["POST"])
def recommend():
    body = request.get_json(silent=True) or {}
    method = body.get("method", "hybrid")
    if method not in ("content", "collaborative", "hybrid"):
        method = "hybrid"
    result = engine.recommend(
        interests=str(body.get("interests", ""))[:500],
        ratings=body.get("ratings", {}),
        method=method,
        level=body.get("level", "any"),
        max_weeks=body.get("max_weeks") or None,
        top_n=8,
    )
    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
