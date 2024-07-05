package main

import (
	"encoding/csv"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type Client struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type Subject struct {
	ID      int    `json:"id"`
	Subject string `json:"subject"`
}

func InitializeCSV(filePath string, headers []string) error {
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		file, err := os.Create(filePath)
		if err != nil {
			log.Printf("Error creating file: %v", err)
			return err
		}
		defer file.Close()

		writer := csv.NewWriter(file)
		defer writer.Flush()

		if err := writer.Write(headers); err != nil {
			log.Printf("Error writing headers to CSV: %v", err)
			return err
		}
	}
	return nil
}

func SaveToCSV(filePath string, record []string) error {
	file, err := os.OpenFile(filePath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Printf("Error opening file: %v", err)
		return err
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	if err := writer.Write(record); err != nil {
		log.Printf("Error writing to CSV: %v", err)
		return err
	}

	return nil
}

func ReadClients() ([]Client, error) {
	file, err := os.Open("clients.csv")
	if err != nil {
		log.Printf("Error opening file: %v", err)
		return nil, err
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		log.Printf("Error reading CSV: %v", err)
		return nil, err
	}

	var clients []Client
	for i, record := range records {
		if i == 0 {
			continue // Skip header
		}
		if len(record) == 4 {
			id, _ := strconv.Atoi(record[0])
			clients = append(clients, Client{
				ID:       id,
				Username: record[1],
				Password: record[2],
				Role:     record[3],
			})
		}
	}
	return clients, nil
}

func ReadSubjects(filePath string) ([]Subject, error) {
	file, err := os.Open(filePath)
	if err != nil {
		log.Printf("Error opening file: %v", err)
		return nil, err
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		log.Printf("Error reading CSV: %v", err)
		return nil, err
	}

	var subjects []Subject
	for i, record := range records {
		if i == 0 {
			continue // Skip header
		}
		if len(record) == 2 {
			id, _ := strconv.Atoi(record[0])
			subjects = append(subjects, Subject{
				ID:      id,
				Subject: record[1],
			})
		}
	}
	return subjects, nil
}

func main() {
	const clientsFilePath = "clients.csv"
	const subjectsFilePath = "subjects.csv"

	if err := InitializeCSV(clientsFilePath, []string{"ID", "Username", "Password", "Role"}); err != nil {
		log.Fatalf("Error initializing clients CSV file: %v", err)
	}

	if err := InitializeCSV(subjectsFilePath, []string{"ID", "Subject"}); err != nil {
		log.Fatalf("Error initializing subjects CSV file: %v", err)
	}

	e := echo.New()

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://127.0.0.1:3000", "http://localhost:3000"},
		AllowMethods: []string{http.MethodGet, http.MethodPut, http.MethodPost, http.MethodDelete},
	}))

	e.POST("/register", func(c echo.Context) error {
		var client Client
		if err := c.Bind(&client); err != nil {
			log.Printf("Error binding client: %v", err)
			return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid input"})
		}

		if client.Username == "" || client.Password == "" || client.Role == "" {
			return c.JSON(http.StatusBadRequest, map[string]string{"message": "All fields are required"})
		}

		clients, err := ReadClients()
		if err != nil {
			log.Printf("Error reading clients: %v", err)
			return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Could not read data"})
		}
		client.ID = len(clients) + 1

		if err := SaveToCSV(clientsFilePath, []string{
			strconv.Itoa(client.ID),
			client.Username,
			client.Password,
			client.Role,
		}); err != nil {
			log.Printf("Error saving to CSV: %v", err)
			return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Could not save data"})
		}

		return c.JSON(http.StatusOK, map[string]string{"message": "Client registered successfully"})
	})

	e.POST("/login", func(c echo.Context) error {
		var loginForm struct {
			Username string `json:"username"`
			Password string `json:"password"`
		}
		if err := c.Bind(&loginForm); err != nil {
			log.Printf("Error binding login form: %v", err)
			return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid input"})
		}

		clients, err := ReadClients()
		if err != nil {
			log.Printf("Error reading clients: %v", err)
			return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Could not read data"})
		}

		var authenticatedClient *Client
		for _, client := range clients {
			if client.Username == loginForm.Username && client.Password == loginForm.Password {
				authenticatedClient = &client
				break
			}
		}

		if authenticatedClient == nil {
			return c.JSON(http.StatusUnauthorized, map[string]string{"message": "Invalid username or password"})
		}

		return c.JSON(http.StatusOK, map[string]interface{}{
			"success": true,
			"role":    authenticatedClient.Role,
		})
	})

	e.POST("/setting", func(c echo.Context) error {
		var subject Subject
		if err := c.Bind(&subject); err != nil {
			log.Printf("Error binding subject: %v", err)
			return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid input"})
		}

		if subject.Subject == "" {
			return c.JSON(http.StatusBadRequest, map[string]string{"message": "Subject is required"})
		}

		subjects, err := ReadSubjects(subjectsFilePath)
		if err != nil {
			log.Printf("Error reading subjects: %v", err)
			return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Could not read data"})
		}
		subject.ID = len(subjects) + 1

		if err := SaveToCSV(subjectsFilePath, []string{
			strconv.Itoa(subject.ID),
			subject.Subject,
		}); err != nil {
			log.Printf("Error saving to CSV: %v", err)
			return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Could not save data"})
		}

		return c.JSON(http.StatusOK, map[string]string{"message": "Subject added successfully"})
	})

	e.GET("/subjects", func(c echo.Context) error {
		subjects, err := ReadSubjects(subjectsFilePath)
		if err != nil {
			log.Printf("Error reading subjects: %v", err)
			return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Could not read data"})
		}

		return c.JSON(http.StatusOK, subjects)
	})

	e.Logger.Fatal(e.Start(":8080"))
}
