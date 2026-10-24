"""Course recommender: three simple, explainable ML techniques.

1. Content-based filtering  -> TF-IDF vectors + cosine similarity
2. Collaborative filtering  -> item-based, cosine similarity on mean-centred ratings
3. Clustering               -> TruncatedSVD + KMeans (also gives the 2-D course map)

The hybrid mode blends (1) and (2).
"""
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA, TruncatedSVD
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import normalize

DATA = Path(__file__).parent / "data"
NEUTRAL_RATING = 3.0  # ratings above this count as "liked", below as "disliked"


class CourseRecommender:
    def __init__(self):
        self.courses = pd.read_csv(DATA / "courses.csv")
        self.ratings = pd.read_csv(DATA / "ratings.csv")
        self.ids = self.courses["id"].tolist()
        self.pos = {cid: i for i, cid in enumerate(self.ids)}
        self._build_content_model()
        self._build_collab_model()
        self._build_clusters()

    # ------------------------------------------------------------------
    # 1. Content-based: TF-IDF
    # ------------------------------------------------------------------
    def _build_content_model(self):
        c = self.courses
        text = (
            (c["title"] + " ") * 2
            + c["category"] + " "
            + (c["skills"].str.replace(",", " ") + " ") * 2
            + c["description"]
        )
        self.vectorizer = TfidfVectorizer(
            stop_words="english", ngram_range=(1, 2), sublinear_tf=True, token_pattern=r"(?u)\b[\w\+\#\.]*[a-zA-Z][\w\+\#]*\b"
        )
        self.tfidf = self.vectorizer.fit_transform(text)  # (n_courses, n_terms), rows L2-normalised
        self.terms = np.array(self.vectorizer.get_feature_names_out())

    def _shared_terms(self, profile, idx, k=3):
        """Words that made this course match the user's profile (for explanations)."""
        overlap = profile.multiply(self.tfidf[idx]).tocoo()
        if overlap.nnz == 0:
            return []
        order = np.argsort(-overlap.data)
        words = []
        for j in order:
            term = self.terms[overlap.col[j]]
            # skip a bigram if one of its words is already listed
            if any(term in w or w in term for w in words):
                continue
            words.append(term)
            if len(words) == k:
                break
        return words

    # ------------------------------------------------------------------
    # 2. Collaborative: item-based
    # ------------------------------------------------------------------
    def _build_collab_model(self):
        matrix = self.ratings.pivot_table(index="user_id", columns="course_id", values="rating")
        matrix = matrix.reindex(columns=self.ids)
        self.rating_matrix = matrix
        centred = matrix.sub(matrix.mean(axis=1), axis=0).fillna(0.0)  # remove each student's own bias
        sim = cosine_similarity(centred.values.T)
        np.fill_diagonal(sim, 0.0)
        self.item_sim = sim
        # Bayesian average -> fair "popular" ranking for brand-new users
        counts = matrix.count()
        means = matrix.mean().fillna(NEUTRAL_RATING)
        global_mean = np.nanmean(matrix.values)
        m = 10
        self.popularity = ((counts * means + m * global_mean) / (counts + m)).values
        self.n_raters = counts.values

    def _collab_scores(self, user_ratings):
        """Predict how much the user would like each course, in the range 0..1."""
        rated = np.array([self.pos[c] for c in user_ratings])
        centred = np.array([user_ratings[c] - NEUTRAL_RATING for c in user_ratings], dtype=float)
        numerator = self.item_sim[:, rated] @ centred
        # the +0.5 'shrinkage' stops one weak signal from giving a perfect score
        denominator = np.abs(self.item_sim[:, rated]).sum(axis=1) + 0.5
        predicted = numerator / denominator           # -2 .. +2
        scores = np.clip((predicted + 2) / 4, 0, 1)   # 0 .. 1
        # which of the user's courses pushed this prediction the most?
        contrib = self.item_sim[:, rated] * centred
        best_source = rated[np.argmax(contrib, axis=1)]
        return scores, best_source

    # ------------------------------------------------------------------
    # 3. Clustering + 2-D map
    # ------------------------------------------------------------------
    def _build_clusters(self, k=8):
        svd = TruncatedSVD(n_components=min(20, self.tfidf.shape[0] - 1), random_state=42)
        reduced = normalize(svd.fit_transform(self.tfidf))
        km = KMeans(n_clusters=k, n_init=10, random_state=42).fit(reduced)
        self.cluster = km.labels_
        xy = PCA(n_components=2, random_state=42).fit_transform(reduced)
        xy = (xy - xy.min(axis=0)) / (xy.max(axis=0) - xy.min(axis=0))
        self.xy = xy
        self.cluster_names = {}
        for cl in range(k):
            members = np.where(self.cluster == cl)[0]
            cats = self.courses.loc[members, "category"].value_counts()
            name = cats.index[0]
            if name in self.cluster_names.values() and len(cats) > 1:
                name = f"{name} + {cats.index[1]}"
            self.cluster_names[cl] = name

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def catalog(self):
        items = []
        for i, row in self.courses.iterrows():
            items.append(self._course_dict(i))
        return {
            "courses": items,
            "clusters": {int(k): v for k, v in self.cluster_names.items()},
            "categories": sorted(self.courses["category"].unique().tolist()),
            "stats": {
                "courses": len(self.courses),
                "students": int(self.ratings["user_id"].nunique()),
                "ratings": len(self.ratings),
            },
        }

    def _course_dict(self, i):
        row = self.courses.iloc[i]
        return {
            "id": int(row["id"]),
            "title": row["title"],
            "category": row["category"],
            "level": row["level"],
            "weeks": int(row["weeks"]),
            "description": row["description"],
            "skills": [s.strip() for s in row["skills"].split(",")],
            "cluster": int(self.cluster[i]),
            "x": round(float(self.xy[i, 0]), 4),
            "y": round(float(self.xy[i, 1]), 4),
            "avg_rating": round(float(np.nan_to_num(self.rating_matrix.iloc[:, i].mean(), nan=0)), 2),
            "n_ratings": int(self.n_raters[i]),
        }

    def recommend(self, interests="", ratings=None, method="hybrid", level="any", max_weeks=None, top_n=8):
        ratings = {int(k): float(v) for k, v in (ratings or {}).items() if int(k) in self.pos}
        interests = (interests or "").strip()
        n = len(self.courses)
        reasons_text = [[] for _ in range(n)]
        note = ""

        unmatched = bool(interests) and not ratings and self.vectorizer.transform([interests]).nnz == 0

        # --- cold start: nothing usable known about the user -> most popular courses
        if (not interests and not ratings) or unmatched:
            scores = (self.popularity - self.popularity.min()) / (np.ptp(self.popularity) + 1e-9)
            used = "popular"
            note = ("None of your words matched the catalog. Try topics like python, design or statistics. Showing what students rate highest."
                    if unmatched else
                    "Add interests or rate a few courses to get personal picks. Showing what students rate highest.")
            for i in range(n):
                reasons_text[i] = [f"rated {self.popularity[i]:.1f}/5 by {self.n_raters[i]} students"]
        else:
            content = np.zeros(n)
            collab = np.zeros(n)
            profile = None
            best_source = None
            has_content = bool(interests) or bool(ratings)
            has_collab = bool(ratings)

            if has_content:
                profile = None
                if interests:
                    q = self.vectorizer.transform([interests])
                    profile = q if q.nnz else None
                    if q.nnz == 0:
                        note = "None of your words matched the catalog, so picks come from the courses you rated."
                liked = {c: r for c, r in ratings.items() if r > NEUTRAL_RATING}
                if liked:
                    weights = np.zeros(n)
                    for c, r in liked.items():
                        weights[self.pos[c]] = r - NEUTRAL_RATING
                    liked_vec = normalize(self.tfidf.T.dot(weights).reshape(1, -1))
                    from scipy.sparse import csr_matrix
                    liked_vec = csr_matrix(liked_vec)
                    profile = liked_vec if profile is None else normalize(profile + 0.8 * liked_vec)
                if profile is not None:
                    content = cosine_similarity(profile, self.tfidf).ravel()
            if has_collab:
                collab, best_source = self._collab_scores(ratings)

            if method == "content" or not has_collab:
                scores, used = content / (content.max() + 1e-9), "content"
                if method != "content" and not has_collab:
                    note = note or "Rate courses you have taken to unlock collaborative filtering."
            elif method == "collaborative" or not has_content:
                scores, used = collab, "collaborative"
            else:
                c_norm = content / (content.max() + 1e-9)
                scores, used = 0.5 * c_norm + 0.5 * collab, "hybrid"

            for i in range(n):
                if used in ("content", "hybrid") and profile is not None:
                    words = self._shared_terms(profile, i)
                    if words:
                        reasons_text[i].append("matches " + ", ".join(words))
                if used in ("collaborative", "hybrid") and best_source is not None and collab[i] > 0.5:
                    src = self.courses.iloc[best_source[i]]["title"]
                    reasons_text[i].append(f"students who liked {src} also liked this")

        # --- filters and ranking
        results = []
        order = np.argsort(-scores)
        for i in order:
            cid = int(self.ids[i])
            if cid in ratings:
                continue
            row = self.courses.iloc[i]
            if level != "any" and row["level"] != level:
                continue
            if max_weeks and int(row["weeks"]) > int(max_weeks):
                continue
            item = self._course_dict(i)
            item["score"] = round(float(np.clip(scores[i], 0, 1)), 3)
            item["reasons"] = reasons_text[i]
            results.append(item)
            if len(results) == top_n:
                break
        return {"method": used, "note": note, "results": results}
