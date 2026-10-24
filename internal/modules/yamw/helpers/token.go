package helper

import (
	"crypto/md5"
	"crypto/rand"
	"encoding/hex"
	"math/big"
)

func GenerateSalt(n int) string {
	letters := []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
	s := make([]rune, n)
	maxLen := big.NewInt(int64(len(letters)))
	for i := range s {
		idx, err := rand.Int(rand.Reader, maxLen)
		if err != nil {
			continue
		}
		s[i] = letters[idx.Int64()]
	}

	return string(s)
}

func CreateToken(password, salt string) string {
	hash := md5.New()
	hash.Write([]byte(password + salt))
	return hex.EncodeToString(hash.Sum(nil))
}
