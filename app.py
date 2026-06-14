import json
import random
from collections import defaultdict
from flask import Flask, render_template, request, send_from_directory

app = Flask(__name__)
app.jinja_env.policies["json.dumps_kwargs"] = {"sort_keys": False}

questions_categorized = defaultdict(list)
scale_order = defaultdict(list)

colors = []

with open("quiz.json") as file:
    for category, scales in json.load(file).items():
        for scale, subquestions in scales.items():
            for question_text, bias in subquestions.items():
                if isinstance(bias, (int, float)) and question_text != "axis":
                    questions_categorized[category].append([scale, bias, question_text])

            colors.append((subquestions["color1"], subquestions["color2"]))
            scale_order[category].append((scale, subquestions["axis"]))


@app.route("/assets/<path:filename>")
def serve_assets(filename):
    return send_from_directory("assets", filename)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/quiz/")
def quiz():
    for category in questions_categorized:
        random.shuffle(questions_categorized[category])

    return render_template(
        "quiz.html", questions=questions_categorized, scale_order=scale_order
    )


@app.route("/results/")
def results():
    scales = []
    coordinates = {}

    for category, axes in scale_order.items():
        horizontal_sum, horizontal_count = 0, 0
        vertical_sum, vertical_count = 0, 0

        for index, (axis, dimension) in enumerate(axes):
            first_percent = int(request.args.get(f"{category[0]}{index}", 50))
            second_percent = 100 - first_percent
            difference = abs(first_percent - second_percent)

            first_ideology, second_ideology = axis.split(" vs ")

            if difference == 0:
                label = f"As much {first_ideology} as {second_ideology}"

            else:
                intensity = (
                    "Slight"
                    if difference < 15
                    else "Moderate"
                    if difference < 40
                    else "Strong"
                    if difference < 70
                    else "Extreme"
                )
                dominant = (
                    first_ideology
                    if first_percent > second_percent
                    else second_ideology
                )
                label = f"{intensity} {dominant}"

            scales.append(
                {
                    "axis": axis,
                    "1st": first_ideology,
                    "2nd": second_ideology,
                    "1st%": first_percent,
                    "2nd%": second_percent,
                    "label": label,
                }
            )

            if dimension == 0:
                horizontal_sum += second_percent * 0.02 - 1
                horizontal_count += 1

            elif dimension == 1:
                vertical_sum += first_percent * 0.02 - 1
                vertical_count += 1

        coordinates[category] = {
            "x": horizontal_sum / horizontal_count,
            "y": vertical_sum / vertical_count,
        }

    return render_template(
        "results.html",
        scales=scales,
        colors=colors,
        planes=coordinates,
        scale_order=scale_order,
    )


if __name__ == "__main__":
    app.run()
