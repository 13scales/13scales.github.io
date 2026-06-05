import json
import random
from typing import Annotated
from collections import defaultdict
from flask import Flask, render_template, request

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

questions_categorized, biases = defaultdict(list), []
dimensions = defaultdict(lambda: defaultdict(list))

with open("quiz.json") as file:
    for category, axes in json.load(file).items():
        for axis_name, subquestions in axes.items():
            for question_text, bias in subquestions.items():
                questions_categorized[category].append([axis_name, bias, question_text, 0])

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/quiz")
def quiz():
    biases.clear()
    dimensions.clear()

    for category in questions_categorized:
        random.shuffle(questions_categorized[category])

        for question in questions_categorized[category]:
            dimensions[category][question[0]].append(len(biases))
            biases.append(question[1])

    return render_template("quiz.html", questions=questions_categorized)

@app.route("/results", methods=["POST"])
def results():
    axis_views = {category: {axis: sum(get_view(biases[index], float(request.form.get(f"#{index}", 0))) for index in indices) / len(indices)
                  for axis, indices in dimensions[category].items()} for category in dimensions}

    # return render_template('results.html', axis_scores=axis_scores)

if __name__ == "__main__":
    app.run(debug=True)
