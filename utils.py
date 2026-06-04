from typing import Annotated

# -1 is radical left/up / strongly disagree; 1 is radical right/down / strongly agree
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
