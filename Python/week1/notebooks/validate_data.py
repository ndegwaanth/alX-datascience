import re
import numpy as np
import pandas as pd
import logging
import sys
import os

from field_data_processor import FieldDataProcessor
from weather_data_processor import WeatherDataProcessor
from data_ingestion import create_db_engine, query_data, read_from_web_CSV

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

patterns = {
    "Rainfall": r"(\d+(\.\d+)?)\s?mm",
    "Temperature": r"(\d+(\.\d+)?)\s?C",
    "Pollution_level": r"=\s*(-?\d+(\.\d+)?)|Pollution at \s*(-?\d+(\.\d+)?)"
}

config_params = {
    "sql_query": """
        SELECT *
        FROM geographic_features
        LEFT JOIN weather_features USING (Field_ID)
        LEFT JOIN soil_and_crop_features USING (Field_ID)
        LEFT JOIN farm_management_features USING (Field_ID)
    """,
    "db_path": "sqlite:///Weather_data-a-4280/Maji_Ndogo_farm_survey_small.db",

    "columns_to_rename": {
        "Annual_yield": "Crop_type",
        "Crop_type": "Annual_yield"
    },

    "values_to_rename": {
        "cassaval": "cassava",
        "wheatn": "wheat",
        "teaa": "tea"
    },

    "weather_csv_path": "https://raw.githubusercontent.com/Explore-AI/Public-Data/master/Maji_Ndogo/Weather_station_data.csv",

    "weather_mapping_csv": "https://raw.githubusercontent.com/Explore-AI/Public-Data/master/Maji_Ndogo/Weather_data_field_mapping.csv",

    "regex_patterns": patterns
}

field_processor = FieldDataProcessor("INFO")
field_processor.process()
field_df = field_processor.df

weather_processor = WeatherDataProcessor(config_params)
weather_processor.process()
weather_df = weather_processor.weather_df

weather_df.to_csv("sampled_weather_df.csv", index=False)
field_df.to_csv("sampled_field_df.csv", index=False)


# =====================================================
#                    TESTS
# =====================================================

def test_read_weather_DataFrame_shape():
    """Weather dataframe should not be empty."""
    assert weather_df.shape[0] > 0
    assert weather_df.shape[1] > 0


def test_read_field_DataFrame_shape():
    """Field dataframe should not be empty."""
    assert field_df.shape[0] > 0
    assert field_df.shape[1] > 0


def test_weather_DataFrame_columns():
    """Weather dataframe contains required columns."""
    required_columns = [
        "Weather_station_ID",
        "Message",
        "Measurement",
        "Value"
    ]

    for col in required_columns:
        assert col in weather_df.columns


def test_field_DataFrame_columns():
    """Field dataframe contains required columns."""
    required_columns = [
        "Field_ID",
        "Crop_type",
        "Elevation",
        "Weather_station"
    ]

    for col in required_columns:
        assert col in field_df.columns


def test_field_DataFrame_non_negative_elevation():
    """Elevation values should all be non-negative."""
    assert (field_df["Elevation"] >= 0).all()


def test_crop_types_are_valid():
    """Misspelled crop names should have been corrected."""
    invalid = {"cassaval", "wheatn", "teaa"}

    assert len(set(field_df["Crop_type"]).intersection(invalid)) == 0


def test_positive_rainfall_values():
    """Rainfall values must be positive."""
    rainfall = weather_df[
        weather_df["Measurement"] == "Rainfall"
    ]

    assert (rainfall["Value"] >= 0).all()


# =====================================================
# Cleanup after tests
# =====================================================

def teardown_module(module):
    """Delete temporary CSV files after pytest finishes."""

    weather_csv_path = "sampled_weather_df.csv"
    field_csv_path = "sampled_field_df.csv"

    if os.path.exists(weather_csv_path):
        os.remove(weather_csv_path)
        print(f"Deleted {weather_csv_path}")

    if os.path.exists(field_csv_path):
        os.remove(field_csv_path)
        print(f"Deleted {field_csv_path}")