import copy

import pytest
from fastapi.testclient import TestClient

from src import app as app_module


BASELINE_ACTIVITIES = copy.deepcopy(app_module.activities)


@pytest.fixture
def client():
    """Create a test client and reset the in-memory activity data before each test."""
    app_module.activities = copy.deepcopy(BASELINE_ACTIVITIES)
    with TestClient(app_module.app) as test_client:
        yield test_client
    app_module.activities = copy.deepcopy(BASELINE_ACTIVITIES)
