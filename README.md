# Nextcourse – Course Recommender (student ML project)

A small web app that recommends university courses using three simple, explainable
machine-learning techniques. Built with **Flask + pandas + scikit-learn**, no database needed.

## Run it

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Open http://127.0.0.1:5000

## Algorithms

| Technique | Where | What it does |
|---|---|---|
| TF-IDF + cosine similarity (content-based) | `recommender.py` → `_build_content_model` | Turns course text into vectors; ranks courses closest to your interests and liked courses |
| Item-based collaborative filtering | `_build_collab_model`, `_collab_scores` | Cosine similarity between courses on mean-centred ratings; predicts your rating for unseen courses |
| Hybrid | `recommend()` | 50 % content score + 50 % collaborative score |
| TruncatedSVD + KMeans + PCA | `_build_clusters` | Groups courses into 8 learning paths and draws the 2-D course map |
| Bayesian average | `_build_collab_model` | "Most popular" fallback when the user is brand new (cold start) |

## Project layout

```
app.py              Flask routes (/, /api/courses, /api/recommend)
recommender.py      All the ML code
data/courses.csv    48 courses (title, category, level, weeks, description, skills)
data/ratings.csv    synthetic student ratings (user_id, course_id, rating)
data/generate_data.py   re-creates both CSV files
templates/index.html    page
static/style.css        design
static/app.js           UI logic and course map
```

## Use your own data

Replace `data/courses.csv` and `data/ratings.csv` keeping the same column names
(course ids must match). Restart the app and everything retrains automatically.

## Ideas to extend (for your report)

- Evaluate with a train/test split (RMSE, precision@k) and compare the three methods.
- Add matrix factorisation (`TruncatedSVD` on the rating matrix) as a fourth method.
- Add login and save each student's ratings in SQLite.
- Tune the hybrid weight (0.5) per user: more content when they have few ratings.
