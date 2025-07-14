module github.com/fastenhealth/fasten-onprem

go 1.21.1

toolchain go1.24.2

//replace github.com/fastenhealth/fasten-sources => ../fasten-sources

//replace github.com/fastenhealth/gofhir-models => ../gofhir-models

replace github.com/mattn/go-sqlite3 v1.14.17 => github.com/jgiannuzzi/go-sqlite3 v1.14.17-0.20230719111531-6e53453ccbd3

//replace gorm.io/driver/sqlite v1.5.4 => github.com/jgiannuzzi/gorm-sqlite v1.4.4-0.20221215225833-42389ad31305

require (
	github.com/Masterminds/sprig/v3 v3.2.3
	github.com/TwiN/deepmerge v0.2.1
	github.com/analogj/go-util v0.0.0-20210417161720-39b497cca03b
	github.com/dave/jennifer v1.6.1
	github.com/dominikbraun/graph v0.15.0
	github.com/dop251/goja v0.0.0-20230605162241-28ee0ee714f3
	github.com/fastenhealth/fasten-sources v0.6.25
	github.com/fastenhealth/gofhir-models v0.0.7
	github.com/gin-gonic/gin v1.9.0
	github.com/go-gormigrate/gormigrate/v2 v2.1.1
	github.com/golang-jwt/jwt/v4 v4.4.2
	github.com/golang/mock v1.6.0
	github.com/google/go-github/v54 v54.0.0
	github.com/google/uuid v1.5.0
	github.com/iancoleman/strcase v0.2.0
	github.com/johnfercher/maroto/v2 v2.3.1
	github.com/lestrrat-go/jwx/v2 v2.0.11
	github.com/samber/lo v1.35.0
	github.com/sirupsen/logrus v1.9.0
	github.com/spf13/viper v1.12.0
	github.com/stretchr/testify v1.8.4
	github.com/urfave/cli/v2 v2.11.2
	golang.org/x/crypto v0.14.0
	golang.org/x/exp v0.0.0-20220303212507-bbda1eaf7a17
	golang.org/x/mod v0.17.0
	golang.org/x/net v0.17.0
	gorm.io/datatypes v1.0.7
	gorm.io/driver/sqlite v1.5.4
	gorm.io/gorm v1.25.4
)

require (
	github.com/Masterminds/goutils v1.1.1 // indirect
	github.com/Masterminds/semver/v3 v3.2.0 // indirect
	github.com/boombuler/barcode v1.0.1 // indirect
	github.com/f-amaral/go-async v0.3.0 // indirect
	github.com/gabriel-vasile/mimetype v1.4.3 // indirect
	github.com/hhrutter/lzw v1.0.0 // indirect
	github.com/hhrutter/tiff v1.0.1 // indirect
	github.com/huandu/xstrings v1.3.3 // indirect
	github.com/imdario/mergo v0.3.11 // indirect
	github.com/jackc/pgpassfile v1.0.0 // indirect
	github.com/jackc/pgservicefile v0.0.0-20221227161230-091c0ba34f0a // indirect
	github.com/jackc/pgx/v5 v5.4.3 // indirect
	github.com/johnfercher/go-tree v1.0.5 // indirect
	github.com/jung-kurt/gofpdf v1.16.2 // indirect
	github.com/mattn/go-runewidth v0.0.15 // indirect
	github.com/mattn/go-sqlite3 v1.14.17 // indirect
	github.com/mitchellh/copystructure v1.0.0 // indirect
	github.com/mitchellh/reflectwalk v1.0.0 // indirect
	github.com/pdfcpu/pdfcpu v0.6.0 // indirect
	github.com/pkg/errors v0.9.1 // indirect
	github.com/rivo/uniseg v0.4.4 // indirect
	github.com/shopspring/decimal v1.2.0 // indirect
	golang.org/x/image v0.18.0 // indirect
)

require (
	github.com/ProtonMail/go-crypto v0.0.0-20230217124315-7d5c6f04bbb8 // indirect
	github.com/bytedance/sonic v1.8.8 // indirect
	github.com/chenzhuoyu/base64x v0.0.0-20221115062448-fe3a3abad311 // indirect
	github.com/cloudflare/circl v1.3.3 // indirect
	github.com/cpuguy83/go-md2man/v2 v2.0.2 // indirect
	github.com/davecgh/go-spew v1.1.1 // indirect
	github.com/decred/dcrd/dcrec/secp256k1/v4 v4.2.0 // indirect
	github.com/dlclark/regexp2 v1.7.0 // indirect
	github.com/fatih/color v1.13.0 // indirect
	github.com/fsnotify/fsnotify v1.5.4 // indirect
	github.com/gin-contrib/sse v0.1.0 // indirect
	github.com/go-playground/locales v0.14.1 // indirect
	github.com/go-playground/universal-translator v0.18.1 // indirect
	github.com/go-playground/validator/v10 v10.16.0 // indirect
	github.com/go-sourcemap/sourcemap v2.1.3+incompatible // indirect
	github.com/go-sql-driver/mysql v1.6.0 // indirect
	github.com/goccy/go-json v0.10.2 // indirect
	github.com/golang/protobuf v1.5.3 // indirect
	github.com/google/go-querystring v1.1.0 // indirect
	github.com/google/pprof v0.0.0-20230207041349-798e818bf904 // indirect
	github.com/hashicorp/hcl v1.0.0 // indirect
	github.com/jinzhu/inflection v1.0.0 // indirect
	github.com/jinzhu/now v1.1.5 // indirect
	github.com/json-iterator/go v1.1.12 // indirect
	github.com/klauspost/cpuid/v2 v2.2.4 // indirect
	github.com/kvz/logstreamer v0.0.0-20150507115422-a635b98146f0 // indirect
	github.com/leodido/go-urn v1.2.4 // indirect
	github.com/lestrrat-go/blackmagic v1.0.1 // indirect
	github.com/lestrrat-go/httpcc v1.0.1 // indirect
	github.com/lestrrat-go/httprc v1.0.4 // indirect
	github.com/lestrrat-go/iter v1.0.2 // indirect
	github.com/lestrrat-go/option v1.0.1 // indirect
	github.com/magiconair/properties v1.8.6 // indirect
	github.com/mattn/go-colorable v0.1.12 // indirect
	github.com/mattn/go-isatty v0.0.18 // indirect
	github.com/mitchellh/go-homedir v1.1.0 // indirect
	github.com/mitchellh/mapstructure v1.5.0 // indirect
	github.com/modern-go/concurrent v0.0.0-20180306012644-bacd9c7ef1dd // indirect
	github.com/modern-go/reflect2 v1.0.2 // indirect
	github.com/pelletier/go-toml v1.9.5 // indirect
	github.com/pelletier/go-toml/v2 v2.0.7 // indirect
	github.com/pmezard/go-difflib v1.0.0 // indirect
	github.com/russross/blackfriday/v2 v2.1.0 // indirect
	github.com/seborama/govcr v4.5.0+incompatible // indirect
	github.com/segmentio/asm v1.2.0 // indirect
	github.com/spf13/afero v1.8.2 // indirect
	github.com/spf13/cast v1.5.0 // indirect
	github.com/spf13/jwalterweatherman v1.1.0 // indirect
	github.com/spf13/pflag v1.0.5 // indirect
	github.com/subosito/gotenv v1.3.0 // indirect
	github.com/twitchyliquid64/golang-asm v0.15.1 // indirect
	github.com/ugorji/go/codec v1.2.11 // indirect
	github.com/xrash/smetrics v0.0.0-20201216005158-039620a65673 // indirect
	golang.org/x/arch v0.3.0 // indirect
	golang.org/x/oauth2 v0.11.0 // indirect
	golang.org/x/sys v0.13.0 // indirect
	golang.org/x/term v0.13.0 // indirect
	golang.org/x/text v0.16.0 // indirect
	google.golang.org/appengine v1.6.7 // indirect
	google.golang.org/protobuf v1.31.0 // indirect
	gopkg.in/ini.v1 v1.66.4 // indirect
	gopkg.in/yaml.v2 v2.4.0 // indirect
	gopkg.in/yaml.v3 v3.0.1 // indirect
	gorm.io/driver/mysql v1.3.2 // indirect
	gorm.io/driver/postgres v1.5.3
)
