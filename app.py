import json
import random
from typing import Annotated
from collections import defaultdict
from flask import Flask, render_template, request, redirect, url_for

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
axis_order = defaultdict(list)

colors = []

with open("quiz.json") as file:
    for category, axes in json.load(file).items():
        for axis, subquestions in axes.items():
            for question_text, bias in subquestions.items():
                if isinstance(bias, (int, float)):
                   questions_categorized[category].append([axis, bias, question_text])

            colors.append((subquestions["color1"], subquestions["color2"]))
            axis_order[category].append(axis)

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

    parameters = {f"{category[0]}{index}": round((1 - axis_views[category][axis][0] / axis_views[category][axis][1]) * 50)
                  for category, axes in axis_order.items() for index, axis in enumerate(axes)}

    return redirect(url_for("results", **parameters))

@app.route("/results")
def results():
    scales = []

    for category, axes in axis_order.items():
        for index, axis in enumerate(axes):
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

    return render_template("results.html", scales=scales, colors=colors)

if __name__ == "__main__":
   app.run(debug=True)
