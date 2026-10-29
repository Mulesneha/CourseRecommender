import unittest

from course_recommender import recommend_courses


COURSES = [
    {
        "id": "python-data",
        "title": "Python for Data Science",
        "description": "Analyze datasets and build machine learning models.",
        "skills": ["Python", "machine learning", "data analysis"],
        "syllabus": ["pandas", "classification"],
    },
    {
        "id": "web-design",
        "title": "Frontend Web Design",
        "description": "Create accessible websites with HTML and CSS.",
        "skills": ["HTML", "CSS", "accessibility"],
    },
    {
        "id": "python-ml",
        "title": "Applied Machine Learning with Python",
        "description": "Train and evaluate predictive models using Python.",
        "skills": ["Python", "machine learning", "model evaluation"],
    },
]


class RecommendCoursesTests(unittest.TestCase):
    def test_ranks_relevant_courses_and_returns_scores(self) -> None:
        recommendations = recommend_courses(
            COURSES,
            "I want to learn Python data analysis and machine learning",
        )

        self.assertEqual(recommendations[0]["course"]["id"], "python-data")
        self.assertEqual(
            [item["rank"] for item in recommendations],
            [1, 2, 3],
        )
        self.assertGreater(recommendations[0]["score"], recommendations[2]["score"])

    def test_top_n_limits_results(self) -> None:
        recommendations = recommend_courses(COURSES, "Python", top_n=1)

        self.assertEqual(len(recommendations), 1)
        self.assertEqual(recommendations[0]["rank"], 1)

    def test_empty_catalog_and_zero_limit_return_empty_results(self) -> None:
        self.assertEqual(recommend_courses([], "Python"), [])
        self.assertEqual(recommend_courses(COURSES, "Python", top_n=0), [])

    def test_rejects_negative_limit(self) -> None:
        with self.assertRaisesRegex(ValueError, "top_n"):
            recommend_courses(COURSES, "Python", top_n=-1)

    def test_rejects_boolean_limit(self) -> None:
        with self.assertRaisesRegex(ValueError, "top_n"):
            recommend_courses(COURSES, "Python", top_n=True)

    def test_rejects_catalog_without_indexable_course_text(self) -> None:
        with self.assertRaisesRegex(ValueError, "indexable text"):
            recommend_courses([{"id": "empty"}], "Python")


if __name__ == "__main__":
    unittest.main()
