package ips

import (
	"bytes"
	"embed"
	"encoding/json"
	"fmt"
	"html/template"
	"math"

	sprig "github.com/Masterminds/sprig/v3"
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"gorm.io/datatypes"
)

//go:embed templates
var ipsTemplates embed.FS

type HTMLRenderer struct {
	templates *template.Template
}

func NewHTMLRenderer() (*HTMLRenderer, error) {
	renderer := &HTMLRenderer{}

	tmpl, err := template.New("ips").Funcs(template.FuncMap{
		"safeHTMLPtr": func(s *string) template.HTML {
			if s == nil {
				return ""
			}
			return template.HTML(*s)
		},
		"safeHTML": func(s string) template.HTML {
			return template.HTML(s)
		},
		"parseStringList": func(data datatypes.JSON) []string {
			var parsed []string
			_ = json.Unmarshal(data, &parsed)
			return parsed
		},
		"parseMapList": func(data datatypes.JSON) []map[string]interface{} {
			var parsed []map[string]interface{}
			_ = json.Unmarshal(data, &parsed)
			return parsed
		},
		"pluckList": func(key string, data []map[string]interface{}) []interface{} {
			values := []interface{}{}
			for _, item := range data {
				values = append(values, item[key])
			}
			return values
		},
		"roundList": func(precision uint, listVals []interface{}) []interface{} {
			results := []interface{}{}
			for ndx, _ := range listVals {
				switch listVal := listVals[ndx].(type) {
				case float64:
					ratio := math.Pow(10, float64(precision))
					results = append(results, math.Round(listVal*ratio)/ratio)
				default:
					results = append(results, listVal)
				}
			}
			return results
		},
	}).Funcs(sprig.FuncMap()).ParseFS(ipsTemplates, "templates/*.gohtml", "templates/includes/*.gohtml")

	if err != nil {
		return nil, err
	}
	renderer.templates = tmpl
	return renderer, nil
}

func (r *HTMLRenderer) GetTemplates() *template.Template {
	return r.templates
}

func (r *HTMLRenderer) Render(data *InternationalPatientSummaryExportData) ([]byte, error) {
	var b bytes.Buffer
	err := r.templates.ExecuteTemplate(&b, "index.gohtml", data)
	if err != nil {
		return nil, fmt.Errorf("failed to render final composition: %w", err)
	}

	return b.Bytes(), nil
}

func (r *HTMLRenderer) RenderSection(sectionType pkg.IPSSections, sectionData *SectionData) (string, error) {
	templateName := fmt.Sprintf("%s.gohtml", sectionType)

	var b bytes.Buffer
	err := r.templates.ExecuteTemplate(&b, templateName, sectionData)
	if err != nil {
		return "", err
	}
	return b.String(), nil
}

func (r *HTMLRenderer) ContentType() string {
	return "text/html"
}

func (r *HTMLRenderer) FileExtension() string {
	return "html"
}
