### START FUNCTION

import logging
import pandas as pd
from sqlalchemy import create_engine, text

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

def create_db_engine(db_path):
    """
    Create and validate a SQLAlchemy database engine.

    This function creates a SQLAlchemy engine using the provided database
    path and verifies the connection by attempting to establish a
    connection to the database.

    Args:
        db_path (str): Connection string or path to the database.

    Returns:
        sqlalchemy.engine.Engine: A SQLAlchemy engine connected to the
        specified database.

    Raises:
        ImportError: If SQLAlchemy is not installed.
        Exception: If the database engine cannot be created or the
            connection fails.
    """
    try:
        engine = create_engine(db_path)

        # Test connection
        with engine.connect() as conn:
            pass

        logger.info("Database engine created successfully.")
        return engine

    except ImportError as e:
        logger.error(
            "SQLAlchemy is required to use this function. Please install it first."
        )
        raise e

    except Exception as e:
        logger.error(f"Failed to create database engine. Error: {e}")
        raise e


def query_data(engine, sql_query):
    """
    Execute an SQL query and return the results as a pandas DataFrame.

    This function runs the supplied SQL query against the connected
    database and loads the results into a pandas DataFrame. It validates
    that the returned DataFrame is not empty.

    Args:
        engine (sqlalchemy.engine.Engine): SQLAlchemy database engine.
        sql_query (str): SQL query to execute.

    Returns:
        pandas.DataFrame: DataFrame containing the query results.

    Raises:
        ValueError: If the query returns an empty DataFrame.
        Exception: If an error occurs while executing the SQL query.
    """
    try:
        with engine.connect() as connection:
            df = pd.read_sql_query(text(sql_query), connection)

        if df.empty:
            msg = "The query returned an empty DataFrame."
            logger.error(msg)
            raise ValueError(msg)

        logger.info("Query executed successfully.")
        return df

    except ValueError as e:
        logger.error(f"SQL query failed. Error: {e}")
        raise e

    except Exception as e:
        logger.error(f"An error occurred while querying the database. Error: {e}")
        raise e


def read_from_web_CSV(URL):
    """
    Read a CSV file from a web URL into a pandas DataFrame.

    This function downloads a CSV file from the specified URL and loads
    it into a pandas DataFrame.

    Args:
        URL (str): URL pointing to the CSV file.

    Returns:
        pandas.DataFrame: DataFrame containing the CSV data.

    Raises:
        pandas.errors.EmptyDataError: If the URL does not contain a valid
            CSV file or the file is empty.
        Exception: If an error occurs while downloading or reading the
            CSV file.
    """
    try:
        df = pd.read_csv(URL)
        logger.info("CSV file read successfully from the web.")
        return df

    except pd.errors.EmptyDataError as e:
        logger.error(
            "The URL does not point to a valid CSV file. Please check the URL and try again."
        )
        raise e

    except Exception as e:
        logger.error(f"Failed to read CSV from the web. Error: {e}")
        raise e

### END FUNCTION