package matheval

import (
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"math"
	"strconv"
)

// EvaluateNumeric evaluates a mathematical expression and returns a numeric result
func EvaluateNumeric(expression string) (float64, error) {
	expr, err := parser.ParseExpr(expression)
	if err != nil {
		return 0, err
	}

	if isComparisonOperator(getBinaryExprOp(expr)) {
		return 0, fmt.Errorf("boolean expression provided to EvaluateNumeric")
	}

	result, err := eval(expr)
	if err != nil {
		return 0, err
	}

	if numResult, ok := result.(float64); ok {
		return numResult, nil
	}
	return 0, fmt.Errorf("non-numeric result")
}

// EvaluateBoolean evaluates a boolean expression and returns true/false
func EvaluateBoolean(expression string) (bool, error) {
	expr, err := parser.ParseExpr(expression)
	if err != nil {
		return false, err
	}

	if !isComparisonOperator(getBinaryExprOp(expr)) {
		return false, fmt.Errorf("numeric expression provided to EvaluateBoolean")
	}

	result, err := eval(expr)
	if err != nil {
		return false, err
	}
	if boolResult, ok := result.(float64); ok {
		return boolResult == 1, nil
	}
	return false, fmt.Errorf("non-boolean result")
}

func getBinaryExprOp(expr ast.Expr) token.Token {
	if bExpr, ok := expr.(*ast.BinaryExpr); ok {
		return bExpr.Op
	}
	return token.ILLEGAL
}

func evaluate(expression string) (float64, error) {
	expr, err := parser.ParseExpr(expression)
	if err != nil {
		return 0, err
	}

	result, err := eval(expr)
	if err != nil {
		return 0, err
	}

	if numResult, ok := result.(float64); ok {
		return numResult, nil
	}
	return 0, fmt.Errorf("non-numeric result")
}

func eval(expr ast.Expr) (interface{}, error) {
	switch expr := expr.(type) {
	case *ast.BinaryExpr:
		// Check if operator is comparison
		if isComparisonOperator(expr.Op) {
			return evalBoolean(expr)
		}
		return evalNumeric(expr)
	case *ast.UnaryExpr:
		operand, err := eval(expr.X)
		if err != nil {
			return 0, err
		}
		if expr.Op == token.SUB {
			if numOperand, ok := operand.(float64); ok {
				return -numOperand, nil
			}
			return nil, fmt.Errorf("non-numeric operand for unary operator")
		}
		return 0, fmt.Errorf("unsupported unary operator: %s", expr.Op) // Handle other unary operators if needed

	case *ast.ParenExpr:
		return eval(expr.X)

	case *ast.BasicLit:
		if expr.Kind == token.INT || expr.Kind == token.FLOAT {
			return strconv.ParseFloat(expr.Value, 64)
		}
		if expr.Kind == token.STRING {
			// Remove quotes from string literal
			return expr.Value[1 : len(expr.Value)-1], nil
		}
		return nil, fmt.Errorf("unsupported literal type: %s", expr.Kind)

	case *ast.Ident:
		switch expr.Name {
		case "pi":
			return math.Pi, nil
		case "e":
			return math.E, nil
		default:
			return expr.Name, nil
		}

	default:
		return 0, fmt.Errorf("unsupported expression type: %T", expr)
	}
}

func evalNumeric(expr *ast.BinaryExpr) (interface{}, error) {
	x, err := eval(expr.X)
	if err != nil {
		return nil, err
	}
	y, err := eval(expr.Y)
	if err != nil {
		return nil, err
	}

	xFloat, okX := x.(float64)
	yFloat, okY := y.(float64)
	if !okX || !okY {
		return nil, fmt.Errorf("non-numeric operands in arithmetic expression")
	}

	switch expr.Op {
	case token.ADD:
		return xFloat + yFloat, nil
	case token.SUB:
		return xFloat - yFloat, nil
	case token.MUL:
		return xFloat * yFloat, nil
	case token.QUO:
		if yFloat == 0 {
			return nil, fmt.Errorf("division by zero")
		}
		return xFloat / yFloat, nil
	case token.REM:
		return math.Mod(xFloat, yFloat), nil
	default:
		return nil, fmt.Errorf("unsupported arithmetic operator: %s", expr.Op)
	}
}

func evalBoolean(expr *ast.BinaryExpr) (interface{}, error) {
	x, err := eval(expr.X)
	if err != nil {
		return nil, err
	}
	y, err := eval(expr.Y)
	if err != nil {
		return nil, err
	}

	// Handle string comparisons
	if xStr, okX := x.(string); okX {
		if yStr, okY := y.(string); okY {
			switch expr.Op {
			case token.EQL:
				return boolToFloat(xStr == yStr), nil
			case token.NEQ:
				return boolToFloat(xStr != yStr), nil
			case token.LSS:
				return boolToFloat(xStr < yStr), nil
			case token.GTR:
				return boolToFloat(xStr > yStr), nil
			case token.LEQ:
				return boolToFloat(xStr <= yStr), nil
			case token.GEQ:
				return boolToFloat(xStr >= yStr), nil
			}
		}
		return nil, fmt.Errorf("cannot compare string with non-string")
	}

	// Handle numeric comparisons
	xFloat, okX := x.(float64)
	yFloat, okY := y.(float64)
	if !okX || !okY {
		return nil, fmt.Errorf("invalid operands for comparison")
	}

	switch expr.Op {
	case token.EQL:
		return boolToFloat(xFloat == yFloat), nil
	case token.NEQ:
		return boolToFloat(xFloat != yFloat), nil
	case token.LSS:
		return boolToFloat(xFloat < yFloat), nil
	case token.GTR:
		return boolToFloat(xFloat > yFloat), nil
	case token.LEQ:
		return boolToFloat(xFloat <= yFloat), nil
	case token.GEQ:
		return boolToFloat(xFloat >= yFloat), nil
	default:
		return nil, fmt.Errorf("unsupported comparison operator: %s", expr.Op)
	}
}

func isComparisonOperator(op token.Token) bool {
	switch op {
	case token.EQL, token.NEQ, token.LSS, token.GTR, token.LEQ, token.GEQ:
		return true
	default:
		return false
	}
}

func boolToFloat(b bool) float64 {
	if b {
		return 1
	}
	return 0
}
