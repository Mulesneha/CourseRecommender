"""Content-based course recommendations using TF-IDF and cosine similarity."""

from collections.abc import Mapping, Sequence
from typing import TypedDict

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class CourseRecommendation(TypedDict):
    course: Mapping[str, object]
    score: float
    rank: int


_TEXT_FIELDS = (
    "title",
    "description",
    "skills",
    "career_roles",
    "syllabus",
    "practical_projects",
)


def _field_text(value: object) -> str:
    if isinstance(value, str):
        return value
    if isinstance(value, Sequence) and not isinstance(value, (str, bytes)):
        return " ".join(item for item in value if isinstance(item, str))
    return ""


def _course_document(course: Mapping[str, object]) -> str:
    return " ".join(_field_text(course.get(field, "")) for field in _TEXT_FIELDS)


def recommend_courses(
    courses: Sequence[Mapping[str, object]],
    learner_profile: str,
    top_n: int | None = 5,
) -> list[CourseRecommendation]:
    """Rank courses by similarity between course content and a learner profile.

    The vectorizer is fitted to the supplied course catalog, then the learner
    profile and each course are represented in the same TF-IDF feature space.
    """
    if top_n is not None and (
        isinstance(top_n, bool) or not isinstance(top_n, int) or top_n < 0
    ):
        raise ValueError("top_n must be a non-negative integer or None")
    if not isinstance(learner_profile, str):
        raise TypeError("learner_profile must be a string")
    if not courses or top_n == 0:
        return []

    documents = [_course_document(course) for course in courses]
    vectorizer = TfidfVectorizer(stop_words="english", sublinear_tf=True)

    try:
        course_vectors = vectorizer.fit_transform(documents)
    except ValueError as error:
        raise ValueError(
            "The course catalog must contain indexable text in its course fields"
        ) from error

    learner_vector = vectorizer.transform([learner_profile])
    scores = cosine_similarity(learner_vector, course_vectors).ravel()
    ranked_indices = sorted(
        range(len(courses)),
        key=lambda index: (-float(scores[index]), index),
    )
    if top_n is not None:
        ranked_indices = ranked_indices[:top_n]

    return [
        {
            "course": courses[index],
            "score": float(scores[index]),
            "rank": rank,
        }
        for rank, index in enumerate(ranked_indices, start=1)
    ]
