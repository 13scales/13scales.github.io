"""Smoke tests for the static build.

Runs with plain `python3 test_freeze.py` (no pytest needed) or under pytest.
Covers the build-time data path: content.json is valid, every page renders, and
the home + info pages actually show the content baked in from content.json.
"""

import json

import app as appmod


def test_content_json_valid():
    with open("content.json") as fh:
        data = json.load(fh)
    assert data["intro"]
    assert len(data["stances"]) == 7, "expected 7 stances"
    assert len(data["ideologies"]) == 13, "expected 13 ideologies"
    assert len(data["scales"]) == 13, "expected 13 scales"


def test_pages_render():
    client = appmod.app.test_client()
    for path in ("/", "/info/", "/quiz/", "/results/"):
        assert client.get(path).status_code == 200, f"{path} did not return 200"


def test_info_page_shows_content():
    body = appmod.app.test_client().get("/info/").get_data(as_text=True)
    assert "Reactionary" in body, "stance missing"
    assert "Neoliberalism" in body, "ideology missing"
    assert "Populism vs Establishmentarianism" in body, "scale missing"


def test_home_lists_scales():
    body = appmod.app.test_client().get("/").get_data(as_text=True)
    assert "Militarism vs Pacifism" in body, "home scales missing"


if __name__ == "__main__":
    test_content_json_valid()
    test_pages_render()
    test_info_page_shows_content()
    test_home_lists_scales()
    print("all smoke tests passed")
