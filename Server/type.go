package main

// User represents a user
type User struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Role     string `json:"role"` // Added role field
}

// Token represents a JWT token
type Token struct {
	Token string `json:"token"`
}

// LoginResponse represents the response for the login endpoint
type LoginResponse struct {
	Token string `json:"token"`
}
