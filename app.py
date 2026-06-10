import json
import random
from typing import Annotated
from collections import defaultdict
from flask import Flask, render_template, request, redirect, url_for, send_from_directory

type Scale = Annotated[int, "[-1, 1]"]

def get_view(bias: Scale, response: Scale) -> Scale:
    if bias < 0: # left/up-leaning question
        if response == 0: # Neutral
            return bias + 0.5

        elif response > 0: # Agree
            return bias + 0.5 - response * (bias + 1.5)

        return bias + 0.5 - response * (0.5 - bias) # Disagree

    # right/down-leaning question
    if response == 0: # Neutral
        return bias - 0.5

    elif response > 0: # Agree
        return bias - 0.5 + response * (1.5 - bias)

    return bias - 0.5 + response * (bias + 0.5) # Disagree

app = Flask(__name__)

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

@app.route("/quiz")
def quiz():
    for category in questions_categorized:
        random.shuffle(questions_categorized[category])

    return render_template("quiz.html", questions=questions_categorized)

@app.route("/results", methods=["POST"])
def results_post():
    axis_views = defaultdict(lambda: defaultdict(lambda: [0, 0]))

    for question in range(50):
        category, axis = request.form[f"#{question}.category"], request.form[f"#{question}.axis"]
        bias, response = float(request.form.get(f"#{question}.bias", 0)), float(request.form.get(f"#{question}.response", 0))

        axis_views[category][axis][0] += get_view(bias, response)
        axis_views[category][axis][1] += 1

    parameters = {f"{category[0]}{index}": ((1 - axis_views[category][axis][0] / axis_views[category][axis][1]) * 50 + 0.5) // 1
                  for category, axes in scale_order.items() for index, (axis, _) in enumerate(axes)}

    return redirect(url_for("results", **parameters))

@app.route("/results")
def results():
    scales = []
    coordinates = []

    for category, axes in scale_order.items():
        horizontal_sum, horizontal_count = 0, 0
        vertical_sum, vertical_count = 0, 0

        for index, (axis, dimension) in enumerate(axes):
            first_percent = int(request.args.get(f"{category[0]}{index}", 50))
            second_percent = round(100 - first_percent, 1)
            difference = abs(first_percent - second_percent)

            first_ideology, second_ideology = axis.split(" vs ")

            if difference == 0:
                label = f"As much {first_ideology} as {second_ideology}"

            else:
                intensity = "Slight" if difference < 15 else "Moderate" if difference < 40 else "Strong" if difference < 70 else "Extreme"
                dominant = first_ideology if first_percent > second_percent else second_ideology
                label = f"{intensity} {dominant}"

            scales.append({"axis": axis, "1st": first_ideology, "2nd": second_ideology,
                           "1st%": first_percent, "2nd%": second_percent, "label": label})

            if dimension == 0:
                horizontal_sum += second_percent * 0.02 - 1
                horizontal_count += 1

            elif dimension == 1:
                vertical_sum += first_percent * 0.02 - 1
                vertical_count += 1

        coordinates.append({"category": category, "x": horizontal_sum / horizontal_count, "y": vertical_sum / vertical_count})

    return render_template("results.html", scales=scales, colors=colors, planes=coordinates)

if __name__ == "__main__":
   app.run(debug=True)
