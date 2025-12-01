using System;
using MySql.Data.MySqlClient;

class InitDatabase
{
    static void Main()
    {
        string connectionString = "server=bgf9yehbozakdrtmbhsh-mysql.services.clever-cloud.com;port=3306;user=uzucbjtgs772k8ic;password=AHM3mKBDCG0QPj6irVS1;database=bgf9yehbozakdrtmbhsh";

        using (MySqlConnection conn = new MySqlConnection(connectionString))
        {
            conn.Open();

            string[] createTableQueries = {
                @"CREATE TABLE IF NOT EXISTS Users (
                    Id INT AUTO_INCREMENT PRIMARY KEY,
                    Username VARCHAR(100) NOT NULL,
                    Password VARCHAR(100) NOT NULL
                );",
                @"CREATE TABLE IF NOT EXISTS Items (
                    Id INT AUTO_INCREMENT PRIMARY KEY,
                    Name VARCHAR(255),
                    IsComplete BOOLEAN,
                    UserId INT,
                    FOREIGN KEY (UserId) REFERENCES Users(Id)
                );"
            };

            foreach (string query in createTableQueries)
            {
                using (MySqlCommand cmd = new MySqlCommand(query, conn))
                {
                    cmd.ExecuteNonQuery();
                }
            }

            Console.WriteLine("כל הטבלאות נוצרו בהצלחה!");
        }
    }
}
