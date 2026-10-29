"""HTTP API for NextCourse's Python TF-IDF recommender."""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from .course_recommender import recommend_courses

app = FastAPI(title="NextCourse Recommender API")


class RecommendationRequest(BaseModel):
    courses: list[dict[str, object]]
    learner_profile: str


class CourseScore(BaseModel):
    id: str
    score: float


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/recommendations", response_model=list[CourseScore])
def get_recommendations(request: RecommendationRequest) -> list[CourseScore]:
    courses_with_ids = [
        course
        for course in request.courses
        if isinstance(course.get("id"), str)
    ]
    if len(courses_with_ids) != len(request.courses):
        raise HTTPException(
            status_code=422,
            detail="Every course must have a string id",
        )

    try:
        ranked = recommend_courses(
            courses_with_ids,
            request.learner_profile,
            top_n=None,
        )
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

    return [
        CourseScore(id=str(item["course"]["id"]), score=item["score"])
        for item in ranked
    ]
