package Helper

import "encoding/json"

func Marshal[T any](v T) (string, error) {
	data, err := json.Marshal(v)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

func Unmarshal[T any](data string) (T, error) {
	var v T
	err := json.Unmarshal([]byte(data), &v)
	if err != nil {
		return v, err
	}
	return v, nil
}
