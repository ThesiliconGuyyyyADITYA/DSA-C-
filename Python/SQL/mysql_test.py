import mysql.connector

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="uk08@adi"
)

print("Connected Successfully!")