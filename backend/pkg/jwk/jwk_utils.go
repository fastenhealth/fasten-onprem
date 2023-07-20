package jwk

import (
	"crypto/rand"
	"crypto/rsa"
	"encoding/json"
	"fmt"
	"github.com/google/uuid"
	"github.com/lestrrat-go/jwx/v2/jwk"
)

//see https://github.com/lestrrat-go/jwx/blob/v2/docs/04-jwk.md#working-with-key-specific-methods
func JWKGenerate() (jwk.RSAPrivateKey, error) {
	raw, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		return nil, fmt.Errorf("failed to generate RSA private key: %s\n", err)
	}

	key, err := jwk.FromRaw(raw)
	if err != nil {
		return nil, fmt.Errorf("failed to create jwk.Key from RSA private key: %s\n", err)
	}

	rsakey, ok := key.(jwk.RSAPrivateKey)
	if !ok {
		return nil, fmt.Errorf("failed to convert jwk.Key into jwk.RSAPrivateKey (was %T)\n", key)
	}
	rsakey.Set("kid", uuid.New().String())

	//_ = rsakey.D()
	//_ = rsakey.DP()
	//_ = rsakey.DQ()
	//_ = rsakey.E()
	//_ = rsakey.N()
	//_ = rsakey.P()
	//_ = rsakey.Q()
	//_ = rsakey.QI()
	//// OUTPUT:

	return rsakey, nil
}

func JWKSerialize(privateKey jwk.RSAPrivateKey) (map[string]string, error) {
	jsonbuf, err := json.Marshal(privateKey)
	if err != nil {
		return nil, err
	}
	var dict map[string]string
	err = json.Unmarshal(jsonbuf, &dict)
	if err != nil {
		return nil, err
	}
	if privateKey.KeyID() != "" {
		dict["kid"] = privateKey.KeyID()
	}

	return dict, err
}

func JWKDeserialize(privateKeyDict map[string]string) (jwk.RSAPrivateKey, error) {
	jsonbuf, err := json.Marshal(privateKeyDict)
	if err != nil {
		return nil, err
	}
	key, err := jwk.ParseKey(jsonbuf)
	if err != nil {
		return nil, fmt.Errorf("failed to create jwk.Key from RSA private key: %s\n", err)
	}
	return key.(jwk.RSAPrivateKey), nil
}
