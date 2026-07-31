### START FUNCTION

"""Field data processing helpers for the Maji Ndogo farm survey project."""

import pandas as pd
from weather_data_processor import WeatherDataProcessor
from data_ingestion import create_db_engine, query_data, read_from_web_CSV
import logging
import os



class FieldDataProcessor:
    """Load, clean, and enrich the field survey data."""

    def __init__(self, config_params, logging_level="INFO"):
        """
        Store configuration values and prepare logging and state.

        Arguments:
            config_params: Dictionary containing the database path, SQL query,
                rename mappings, and weather mapping CSV URL.
            logging_level: Logging level to use for the processor.
        """
        self.db_path = config_params["db_path"]
        self.sql_query = config_params["sql_query"]
        self.columns_to_rename = config_params["columns_to_rename"]
        self.values_to_rename = config_params["values_to_rename"]
        self.weather_map_data = config_params["weather_mapping_csv"]
        
        self.initialize_logging(logging_level)

        # We create empty objects to store the DataFrame and engine in
        self.df = None
        self.engine = None
        
    # This method enables logging in the class.
    def initialize_logging(self, logging_level):
        """
        Sets up logging for this instance of FieldDataProcessor.

        Arguments:
            logging_level: Logging level to use for this instance.
        """
        logger_name = __name__ + ".FieldDataProcessor"
        self.logger = logging.getLogger(logger_name)
        self.logger.propagate = False  # Prevents log messages from being propagated to the root logger

        # Set logging level
        if logging_level.upper() == "DEBUG":
            log_level = logging.DEBUG
        elif logging_level.upper() == "INFO":
            log_level = logging.INFO
        elif logging_level.upper() == "NONE":  # Option to disable logging
            self.logger.disabled = True
            return
        else:
            log_level = logging.INFO  # Default to INFO

        self.logger.setLevel(log_level)

        # Only add handler if not already added to avoid duplicate messages
        if not self.logger.handlers:
            ch = logging.StreamHandler()  # Create console handler
            formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
            ch.setFormatter(formatter)
            self.logger.addHandler(ch)

        # Use self.logger.info(), self.logger.debug(), etc.


    # let's focus only on this part from now on
    def ingest_sql_data(self):
        """Read the source farm data from SQLite into `self.df`."""
        try:
            self.engine = create_db_engine(self.db_path)
            self.df = query_data(self.engine, self.sql_query)
            self.logger.info("Sucessfully loaded data.")
            self.logger.info("Swapped columns: Annual_yield with Crop_type")
            return self.df
        except Exception as e:
            self.logger.error(f"Failed to ingest SQL data. Error: {e}")
            raise e
        except Exception as e:
            self.logger.error(f"An error occurred while ingesting SQL data. Error: {e}")
            raise e

    def rename_columns(self):
        """Swap the crop and yield columns and normalise elevation values."""
        self.df.rename(columns={'Annual_yield': 'Crop_type_Temp', 'Crop_type': 'Annual_yield'}, inplace=True)
        self.df.rename(columns={'Crop_type_Temp': 'Crop_type'}, inplace=True)
        self.df['Elevation'] = self.df['Elevation'].abs()


    def apply_corrections(self):
        """Correct known misspellings in the crop type values."""
        # Correcting 'Crop_type' column
        def correct_crop_type(crop):
            corrections = {
                'cassaval': 'cassava',
                'wheatn': 'wheat',
                'teaa': 'tea'
            }
            return corrections.get(crop, crop)  # Get the corrected crop type, or return the original if not in corrections

        # Apply the correction function to the Crop_type column
        self.df['Crop_type'] = self.df['Crop_type'].apply(correct_crop_type)

    def weather_station_mapping(self):
        """
        Merge weather station mapping data with the main DataFrame.

        Returns:
            pandas.DataFrame: Updated DataFrame containing weather station mappings.
        """
        try:
            weather = pd.read_csv(self.weather_map_data)

            # Merge on the common column
            self.df = self.df.merge(
                weather,
                on="Field_ID",
                how="left"
            )
            self.logger.info("CSV file read successfully from the web.")
            self.logger.info("Weather station mapping merged successfully.")
            return self.df

        except Exception as e:
            self.logger.error(f"Failed to merge weather station mapping: {e}")
            raise

    def process(self):
        """
        Execute the complete data ingestion and preprocessing pipeline.

        The pipeline performs the following steps:
            1. Initialize logging.
            2. Load data from the SQL database.
            3. Rename columns.
            4. Apply data corrections.
            5. Merge weather station mapping data.

        Returns:
            pandas.DataFrame: The fully processed dataset.
        """
        self.initialize_logging("INFO")
        self.ingest_sql_data()
        self.rename_columns()
        self.apply_corrections()
        self.weather_station_mapping()

        return self.df
    
config_params = {
    "sql_query": """
        SELECT *
        FROM geographic_features
        LEFT JOIN weather_features USING (Field_ID)
        LEFT JOIN soil_and_crop_features USING (Field_ID)
        LEFT JOIN farm_management_features USING (Field_ID)
    """, 
    "db_path": "sqlite:///Maji_Ndogo_farm_survey_small.db", 

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

    "weather_mapping_csv": "https://raw.githubusercontent.com/Explore-AI/Public-Data/master/Maji_Ndogo/Weather_data_field_mapping.csv"
}


if __name__ == "__main__":
    field_processor = FieldDataProcessor(config_params=config_params, logging_level="INFO")
    field_processor.process()

    field_df = field_processor.df
    print(field_df["Weather_station"].unique())

### END FUNCTION