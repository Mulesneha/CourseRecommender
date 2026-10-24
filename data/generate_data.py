"""Builds data/courses.csv and data/ratings.csv.

Run once:  python data/generate_data.py
The ratings are synthetic: every fake student has one or two favourite
categories, rates those highly and everything else lower with some noise.
Replace both CSV files with real data and the app keeps working.
"""
import csv
import random
from pathlib import Path

OUT = Path(__file__).parent

# (title, category, level, weeks, description, skills)
COURSES = [
    # Programming
    ("Python Foundations", "Programming", "Beginner", 6, "Learn to write clean Python programs with variables, loops, functions and files.", "python, programming basics, functions, problem solving, scripting"),
    ("Java Object-Oriented Programming", "Programming", "Intermediate", 8, "Design software with classes, inheritance, interfaces and design patterns in Java.", "java, object oriented, classes, design patterns, debugging"),
    ("Data Structures and Algorithms", "Programming", "Intermediate", 10, "Master lists, trees, graphs, sorting and complexity analysis for coding interviews.", "algorithms, data structures, complexity, recursion, graphs"),
    ("C++ for Systems Programming", "Programming", "Intermediate", 8, "Write fast low-level code with pointers, memory management and the STL.", "c++, pointers, memory, performance, systems"),
    ("Software Engineering with Git and Agile", "Programming", "Intermediate", 6, "Work in teams using Git, code review, testing and agile sprints.", "git, agile, testing, teamwork, software process"),
    ("Operating Systems Essentials", "Programming", "Advanced", 10, "Understand processes, threads, scheduling, memory and file systems.", "operating systems, processes, threads, scheduling, memory"),
    # Data & AI
    ("Data Analysis with Pandas", "Data & AI", "Beginner", 5, "Clean, reshape and explore real datasets using Python and pandas.", "python, pandas, data cleaning, analysis, notebooks"),
    ("Machine Learning Fundamentals", "Data & AI", "Intermediate", 8, "Build regression, classification and clustering models with scikit-learn.", "machine learning, scikit-learn, regression, classification, clustering"),
    ("Deep Learning with Neural Networks", "Data & AI", "Advanced", 10, "Train neural networks for images and text using modern deep learning tools.", "deep learning, neural networks, tensorflow, images, optimization"),
    ("SQL and Database Design", "Data & AI", "Beginner", 5, "Model data with tables and query it with joins, aggregates and indexes.", "sql, databases, queries, schema design, joins"),
    ("Natural Language Processing", "Data & AI", "Advanced", 8, "Teach computers to read text: tokenisation, embeddings, classification and chatbots.", "nlp, text mining, embeddings, language models, python"),
    ("Data Visualization Storytelling", "Data & AI", "Beginner", 4, "Turn numbers into clear charts and dashboards that persuade an audience.", "charts, dashboards, storytelling, visualization, analytics"),
    # Web Development
    ("HTML and CSS from Scratch", "Web Development", "Beginner", 4, "Build responsive, accessible web pages with modern HTML and CSS.", "html, css, responsive design, accessibility, layout"),
    ("JavaScript Essentials", "Web Development", "Beginner", 6, "Add interactivity to websites with variables, the DOM, events and fetch.", "javascript, dom, events, web, programming basics"),
    ("React Front-End Development", "Web Development", "Intermediate", 7, "Create fast single-page apps with React components, hooks and state.", "react, components, javascript, state management, front-end"),
    ("Node.js and REST APIs", "Web Development", "Intermediate", 6, "Build back-end services and REST APIs with Node.js, Express and databases.", "node.js, express, api, back-end, javascript"),
    ("Full-Stack Web Project", "Web Development", "Advanced", 10, "Plan, build and deploy a complete web application from database to browser.", "full-stack, deployment, databases, front-end, back-end"),
    ("Progressive Web Apps and Mobile Web", "Web Development", "Intermediate", 5, "Make web apps installable, offline-ready and smooth on phones.", "pwa, mobile, service workers, performance, javascript"),
    # Design
    ("UI/UX Design Principles", "Design", "Beginner", 6, "Learn how to design interfaces people find clear, useful and enjoyable.", "ux, ui, usability, wireframes, interaction design"),
    ("Figma Prototyping", "Design", "Beginner", 4, "Design screens and clickable prototypes in Figma with components and auto-layout.", "figma, prototyping, components, mockups, ui"),
    ("Graphic Design Basics", "Design", "Beginner", 5, "Use colour, shape, imagery and composition to create posters and brand identities.", "colour theory, composition, branding, illustration, visual design"),
    ("Typography and Layout", "Design", "Intermediate", 4, "Choose typefaces, set hierarchy and build grids for print and screen.", "typography, layout, grids, hierarchy, editorial design"),
    ("User Research Methods", "Design", "Intermediate", 6, "Plan interviews, surveys and usability tests that uncover what users need.", "user research, interviews, surveys, usability testing, empathy"),
    ("Motion Design and Animation", "Design", "Intermediate", 6, "Bring interfaces and videos to life with timing, easing and keyframes.", "animation, motion, keyframes, video, interaction design"),
    # Business
    ("Entrepreneurship and Startups", "Business", "Beginner", 6, "Test business ideas, build a lean model and pitch to investors.", "startups, business model, pitching, innovation, lean"),
    ("Digital Marketing Fundamentals", "Business", "Beginner", 5, "Grow an audience with SEO, social media, email and paid campaigns.", "marketing, seo, social media, content, campaigns"),
    ("Financial Accounting Basics", "Business", "Beginner", 8, "Read balance sheets, track cash flow and understand how companies report money.", "accounting, finance, balance sheet, budgeting, reporting"),
    ("Product Management", "Business", "Intermediate", 6, "Decide what to build next: roadmaps, prioritisation and working with engineers.", "product, roadmap, prioritisation, stakeholders, agile"),
    ("Business Analytics with Excel", "Business", "Intermediate", 5, "Model scenarios and answer business questions with pivot tables and formulas.", "excel, analytics, pivot tables, forecasting, modelling"),
    ("Strategy and Operations Management", "Business", "Advanced", 8, "Analyse competition, supply chains and processes to improve how firms run.", "strategy, operations, supply chain, management, competition"),
    # Math & Science
    ("Calculus I", "Math & Science", "Beginner", 12, "Limits, derivatives and integrals with applications in science and engineering.", "calculus, derivatives, integrals, limits, mathematics"),
    ("Linear Algebra for Engineers", "Math & Science", "Intermediate", 10, "Vectors, matrices, eigenvalues and transformations used across engineering.", "linear algebra, matrices, vectors, eigenvalues, mathematics"),
    ("Probability and Statistics", "Math & Science", "Intermediate", 10, "Reason about uncertainty with distributions, sampling and hypothesis tests.", "probability, statistics, distributions, hypothesis testing, data"),
    ("Physics: Mechanics", "Math & Science", "Beginner", 12, "Forces, motion, energy and momentum explained with worked problems.", "physics, mechanics, forces, energy, problem solving"),
    ("Discrete Mathematics", "Math & Science", "Intermediate", 8, "Logic, sets, proofs, counting and graphs for computer science.", "logic, proofs, sets, graphs, combinatorics"),
    ("Numerical Methods and Scientific Computing", "Math & Science", "Advanced", 8, "Solve equations and simulate systems numerically with Python.", "numerical methods, simulation, python, optimization, mathematics"),
    # Cybersecurity
    ("Introduction to Cybersecurity", "Cybersecurity", "Beginner", 5, "Understand threats, attacks and the basics of keeping systems safe.", "security, threats, risk, passwords, defence"),
    ("Networking Fundamentals", "Cybersecurity", "Beginner", 6, "How the internet works: TCP/IP, DNS, routing, firewalls and Wi-Fi.", "networking, tcp/ip, dns, routing, firewalls"),
    ("Ethical Hacking and Penetration Testing", "Cybersecurity", "Advanced", 8, "Find and exploit weaknesses legally in lab environments to harden systems.", "penetration testing, hacking, vulnerabilities, kali linux, security"),
    ("Cryptography Essentials", "Cybersecurity", "Intermediate", 8, "Encryption, hashing, signatures and the maths that keeps data private.", "cryptography, encryption, hashing, keys, mathematics"),
    ("Secure Web Application Development", "Cybersecurity", "Intermediate", 6, "Prevent injection, XSS and broken authentication in web apps.", "web security, owasp, authentication, injection, javascript"),
    ("Digital Forensics and Incident Response", "Cybersecurity", "Advanced", 7, "Investigate breaches, collect evidence and respond to security incidents.", "forensics, incident response, logs, investigation, security"),
    # Communication
    ("Public Speaking and Presentation", "Communication", "Beginner", 4, "Plan, rehearse and deliver talks with confidence and clear slides.", "public speaking, presentation, confidence, storytelling, slides"),
    ("Technical Writing for Engineers", "Communication", "Beginner", 4, "Write documentation, reports and emails that busy readers understand.", "technical writing, documentation, reports, clarity, editing"),
    ("Academic Research and Writing", "Communication", "Intermediate", 6, "Find sources, structure arguments and cite properly in essays and theses.", "research, academic writing, citations, essays, literature review"),
    ("Negotiation and Conflict Resolution", "Communication", "Intermediate", 5, "Reach agreements and handle disagreements in teams and workplaces.", "negotiation, conflict, persuasion, teamwork, communication"),
    ("Team Leadership", "Communication", "Intermediate", 6, "Motivate groups, give feedback and run effective meetings and projects.", "leadership, feedback, teamwork, management, motivation"),
    ("Critical Thinking and Argumentation", "Communication", "Beginner", 5, "Spot weak arguments, evaluate evidence and make your own case clearly.", "critical thinking, logic, argument, evidence, reasoning"),
]

# Categories whose students often also enjoy another category.
BRIDGES = {
    "Data & AI": ["Programming", "Math & Science"],
    "Web Development": ["Design", "Programming"],
    "Cybersecurity": ["Programming", "Web Development"],
    "Design": ["Web Development", "Communication"],
    "Business": ["Communication", "Data & AI"],
    "Programming": ["Math & Science", "Cybersecurity"],
    "Math & Science": ["Data & AI", "Programming"],
    "Communication": ["Business", "Design"],
}


def main(n_students=250, seed=7):
    rnd = random.Random(seed)
    with open(OUT / "courses.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["id", "title", "category", "level", "weeks", "description", "skills"])
        for i, row in enumerate(COURSES, start=1):
            w.writerow([i, *row])

    cats = sorted({c[1] for c in COURSES})
    by_cat = {c: [i for i, r in enumerate(COURSES, 1) if r[1] == c] for c in cats}
    rows = []
    for u in range(1, n_students + 1):
        main_cat = rnd.choice(cats)
        favourites = {main_cat, rnd.choice(BRIDGES[main_cat])}
        pool = []
        for c in sorted(favourites):
            pool += rnd.sample(by_cat[c], k=min(4, len(by_cat[c])))
        pool += rnd.sample(range(1, len(COURSES) + 1), k=rnd.randint(2, 4))
        for cid in sorted(set(pool)):
            cat = COURSES[cid - 1][1]
            base = 4.3 if cat in favourites else 2.7
            rating = round(min(5, max(1, rnd.gauss(base, 0.8))))
            rows.append((u, cid, rating))
    with open(OUT / "ratings.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["user_id", "course_id", "rating"])
        w.writerows(rows)
    print(f"{len(COURSES)} courses, {len(rows)} ratings from {n_students} students")


if __name__ == "__main__":
    main()
