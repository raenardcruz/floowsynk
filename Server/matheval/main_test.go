package matheval

import (
	"testing"
)

func TestEvaluateBoolean(t *testing.T) {
	tests := []struct {
		name       string
		expression string
		want       bool
		wantErr    bool
	}{
		// Comparisons
		{"numeric equality true", "5 == 5", true, false},
		{"numeric equality false", "5 == 6", false, false},
		{"numeric inequality", "5 != 6", true, false},
		{"numeric greater than", "10 > 5", true, false},
		{"numeric less than", "3 < 7", true, false},
		{"numeric greater than or equal", "5 >= 5", true, false},
		{"numeric less than or equal", "4 <= 5", true, false},
		{"string equality", `"hello" == "hello"`, true, false},
		{"string inequality", `"hello" != "world"`, true, false},

		// Boolean identifiers
		{"literal true", "true", true, false},
		{"literal false", "false", false, false},
		{"literal True", "True", true, false},
		{"literal False", "False", false, false},

		// Unary NOT
		{"not true", "!true", false, false},
		{"not false", "!false", true, false},
		{"not True", "!True", false, false},
		{"not False", "!False", true, false},
		{"not comparison", "!(5 > 10)", true, false},
		{"double not", "!!true", true, false},

		// Logical AND
		{"true AND true", "true && true", true, false},
		{"true AND false", "true && false", false, false},
		{"false AND true", "false && true", false, false},
		{"false AND false", "false && false", false, false},
		{"comparison AND comparison true", "5 > 2 && 10 < 20", true, false},
		{"comparison AND comparison false", "5 > 2 && 10 > 20", false, false},

		// Logical OR
		{"true OR false", "true || false", true, false},
		{"false OR true", "false || true", true, false},
		{"false OR false", "false || false", false, false},
		{"true OR true", "true || true", true, false},
		{"comparison OR comparison", "5 > 10 || 3 < 7", true, false},

		// Complex expressions
		{"complex nested logical", "(true && false) || (true && !false)", true, false},
		{"chained AND and OR", "1 == 1 && 2 == 2 || 3 == 4", true, false},
		{"parens with comparison", "(5 > 3) && (10 >= 10)", true, false},
		{"boolean equality", "true == true", true, false},
		{"boolean inequality", "true != false", true, false},

		// Invalid expressions
		{"pure numeric expression rejected", "5 + 5", false, true},
		{"syntax error", "5 > > 2", false, true},
		{"empty expression", "", false, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := EvaluateBoolean(tt.expression)
			if (err != nil) != tt.wantErr {
				t.Errorf("EvaluateBoolean(%q) error = %v, wantErr %v", tt.expression, err, tt.wantErr)
				return
			}
			if !tt.wantErr && got != tt.want {
				t.Errorf("EvaluateBoolean(%q) = %v, want %v", tt.expression, got, tt.want)
			}
		})
	}
}

func TestEvaluateNumeric(t *testing.T) {
	tests := []struct {
		name       string
		expression string
		want       float64
		wantErr    bool
	}{
		{"simple addition", "2 + 3", 5, false},
		{"subtraction", "10 - 4", 6, false},
		{"multiplication and precedence", "2 + 3 * 4", 14, false},
		{"unary minus", "-5 + 10", 5, false},
		{"boolean expression rejected", "5 > 2", 0, true},
		{"boolean logical rejected", "true && false", 0, true},
		{"boolean literal rejected", "true", 0, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := EvaluateNumeric(tt.expression)
			if (err != nil) != tt.wantErr {
				t.Errorf("EvaluateNumeric(%q) error = %v, wantErr %v", tt.expression, err, tt.wantErr)
				return
			}
			if !tt.wantErr && got != tt.want {
				t.Errorf("EvaluateNumeric(%q) = %v, want %v", tt.expression, got, tt.want)
			}
		})
	}
}
