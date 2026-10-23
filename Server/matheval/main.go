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

	if isBooleanExpr(expr) {
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

	if !isBooleanExpr(expr) {
		return false, fmt.Errorf("numeric expression provided to EvaluateBoolean")
	}

	result, err := eval(expr)
	if err != nil {
		return false, err
	}
	if b, ok := result.(bool); ok {
		return b, nil
	}
	if boolResult, ok := result.(float64); ok {
		return boolResult == 1, nil
	}
	return false, fmt.Errorf("non-boolean result")
}

func isLogicalOperator(op token.Token) bool {
	return op == token.LAND || op == token.LOR
}

func isComparisonOperator(op token.Token) bool {
	switch op {
	case token.EQL, token.NEQ, token.LSS, token.GTR, token.LEQ, token.GEQ:
		return true
	default:
		return false
	}
}

func isBooleanIdent(name string) bool {
	switch name {
	case "true", "false", "True", "False":
		return true
	default:
		return false
	}
}

func isBooleanExpr(expr ast.Expr) bool {
	for {
		if paren, ok := expr.(*ast.ParenExpr); ok {
			expr = paren.X
		} else {
			break
		}
	}

	switch e := expr.(type) {
	case *ast.BinaryExpr:
		return isComparisonOperator(e.Op) || isLogicalOperator(e.Op)
	case *ast.UnaryExpr:
		return e.Op == token.NOT
	case *ast.Ident:
		return isBooleanIdent(e.Name)
	default:
		return false
	}
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

func toBool(val interface{}) (bool, error) {
	switch v := val.(type) {
	case bool:
		return v, nil
	case float64:
		return v != 0, nil
	case int:
		return v != 0, nil
	case string:
		if v == "true" || v == "True" {
			return true, nil
		}
		if v == "false" || v == "False" {
			return false, nil
		}
		return false, fmt.Errorf("cannot convert string %q to boolean", v)
	default:
		return false, fmt.Errorf("expected boolean value, got %T (%v)", val, val)
	}
}

func eval(expr ast.Expr) (interface{}, error) {
	switch expr := expr.(type) {
	case *ast.BinaryExpr:
		if isComparisonOperator(expr.Op) || isLogicalOperator(expr.Op) {
			return evalBoolean(expr)
		}
		return evalNumeric(expr)

	case *ast.UnaryExpr:
		operand, err := eval(expr.X)
		if err != nil {
			return nil, err
		}
		if expr.Op == token.SUB {
			if numOperand, ok := operand.(float64); ok {
				return -numOperand, nil
			}
			return nil, fmt.Errorf("non-numeric operand for unary operator")
		}
		if expr.Op == token.NOT {
			b, err := toBool(operand)
			if err != nil {
				return nil, err
			}
			return !b, nil
		}
		return nil, fmt.Errorf("unsupported unary operator: %s", expr.Op)

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
		case "true", "True":
			return true, nil
		case "false", "False":
			return false, nil
		default:
			return expr.Name, nil
		}

	default:
		return nil, fmt.Errorf("unsupported expression type: %T", expr)
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
	if isLogicalOperator(expr.Op) {
		x, err := eval(expr.X)
		if err != nil {
			return nil, err
		}
		xBool, err := toBool(x)
		if err != nil {
			return nil, err
		}

		if expr.Op == token.LAND && !xBool {
			return false, nil
		}
		if expr.Op == token.LOR && xBool {
			return true, nil
		}

		y, err := eval(expr.Y)
		if err != nil {
			return nil, err
		}
		yBool, err := toBool(y)
		if err != nil {
			return nil, err
		}

		if expr.Op == token.LAND {
			return xBool && yBool, nil
		}
		return xBool || yBool, nil
	}

	x, err := eval(expr.X)
	if err != nil {
		return nil, err
	}
	y, err := eval(expr.Y)
	if err != nil {
		return nil, err
	}

	// Handle boolean comparisons
	if xBool, okX := x.(bool); okX {
		if yBool, okY := y.(bool); okY {
			switch expr.Op {
			case token.EQL:
				return xBool == yBool, nil
			case token.NEQ:
				return xBool != yBool, nil
			default:
				return nil, fmt.Errorf("unsupported boolean comparison operator: %s", expr.Op)
			}
		}
		return nil, fmt.Errorf("cannot compare bool with non-bool")
	}

	// Handle string comparisons
	if xStr, okX := x.(string); okX {
		if yStr, okY := y.(string); okY {
			switch expr.Op {
			case token.EQL:
				return xStr == yStr, nil
			case token.NEQ:
				return xStr != yStr, nil
			case token.LSS:
				return xStr < yStr, nil
			case token.GTR:
				return xStr > yStr, nil
			case token.LEQ:
				return xStr <= yStr, nil
			case token.GEQ:
				return xStr >= yStr, nil
			default:
				return nil, fmt.Errorf("unsupported comparison operator: %s", expr.Op)
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
		return xFloat == yFloat, nil
	case token.NEQ:
		return xFloat != yFloat, nil
	case token.LSS:
		return xFloat < yFloat, nil
	case token.GTR:
		return xFloat > yFloat, nil
	case token.LEQ:
		return xFloat <= yFloat, nil
	case token.GEQ:
		return xFloat >= yFloat, nil
	default:
		return nil, fmt.Errorf("unsupported comparison operator: %s", expr.Op)
	}
}

func boolToFloat(b bool) float64 {
	if b {
		return 1
	}
	return 0
}
