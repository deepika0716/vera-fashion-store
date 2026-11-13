import mysql.connector

try:
    connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password="***REMOVED***",
        database="vera_db"
    )

    print("MySQL Connected Successfully!")

    connection.close()

except Exception as error:
    print("Connection failed:", error)