package errors

import (
	"fmt"
)

// Raised when config file is missing
type ConfigFileMissingError string

func (str ConfigFileMissingError) Error() string {
	return fmt.Sprintf("ConfigFileMissingError: %q", string(str))
}

// Raised when the config file doesnt match schema
type ConfigValidationError string

func (str ConfigValidationError) Error() string {
	return fmt.Sprintf("ConfigValidationError: %q", string(str))
}

// Raised when the database type is unsupported
type DatabaseTypeNotSupportedError string

func (str DatabaseTypeNotSupportedError) Error() string {
	return fmt.Sprintf("DatabaseTypeNotSupportedError: %q", string(str))
}
