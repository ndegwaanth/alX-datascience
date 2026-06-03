import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.engine import URL

# 🔹 IMPORTANT: specify separator
df = pd.read_csv(
    r"C:\Users\Anthony\Pictures\alx-datascience\week6\SQL\access_to_basic_services.csv",
    sep=';'
)

db_url = URL.create(
    drivername="mysql+mysqlconnector",
    username="anthony",
    password="Sucess@22",
    host="localhost",
    database="united_nations",
)

engine = create_engine(db_url)

df.to_sql("Water_Basic_Services", con=engine, if_exists="append", index=False)