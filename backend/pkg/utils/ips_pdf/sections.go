package ips_pdf

import (
	"fmt"
	"strings"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/utils/ips"
	"github.com/johnfercher/maroto/v2/pkg/components/col"
	"github.com/johnfercher/maroto/v2/pkg/components/image"
	"github.com/johnfercher/maroto/v2/pkg/components/line"
	"github.com/johnfercher/maroto/v2/pkg/components/row"
	"github.com/johnfercher/maroto/v2/pkg/components/text"
	"github.com/johnfercher/maroto/v2/pkg/consts/align"
	"github.com/johnfercher/maroto/v2/pkg/consts/fontstyle"
	"github.com/johnfercher/maroto/v2/pkg/core"
	"github.com/johnfercher/maroto/v2/pkg/props"
)

func getDocumentHeader(data *ips.InternationalPatientSummaryExportData) []core.Row {

	return []core.Row{
		row.New().Add(
			col.New(8).Add(
				text.New(fmt.Sprintf("Patient Health Summary; Generated: %s", data.GenerationDate.Format("2006-01-02")), props.Text{Top: 3}),
				text.New(fmt.Sprintf("ID: %s", *data.Composition.Identifier.Value), props.Text{Top: 8}),
			),
			image.NewFromFileCol(4, "backend/pkg/utils/ips_pdf/assets/fasten_logo.jpg", props.Rect{Percent: 80, Center: true}),
		),
		row.New().Add(
			col.New(12).Add(
				text.New(fmt.Sprintf("Author: %s", *data.Composition.Identifier.System), props.Text{Align: align.Right}),
			),
		),
		row.New(12),
	}

}

func renderPatientSection(m core.Maroto, patient *database.FhirPatient) {
	patientName := pluckStringListValue(patient.Name)
	address := pluckStringListValue(patient.Address)
	communication := pluckMapListValue(patient.Telecom, "code", "")

	birthDate := "Unknown"
	if patient.Birthdate != nil {
		birthDate = patient.Birthdate.Format("2006-01-02")
	}

	m.AddAutoRow(
		col.New(12).Add(
			text.New(patientName, h1Style),
		),
	)

	m.AddRow(10)

	m.AddRow(10,
		text.NewCol(2, "Born", tableHeaderStyle),
		text.NewCol(2, "Language", tableHeaderStyle),
		text.NewCol(2, "Race/Ethnicity", tableHeaderStyle),
		text.NewCol(3, "Address", tableHeaderStyle),
		text.NewCol(3, "Communication", tableHeaderStyle),
	).WithStyle(&tableHeaderCell)

	m.AddAutoRow(
		newTextCol(2, birthDate),
		newTextCol(2, "English"),
		newTextCol(2, "Unknown / Unknown"),
		newTextCol(3, address),
		newTextCol(3, communication),
	).WithStyle(&tableBodyCell)

	m.AddRow(16)
}

func renderSourcesSection(m core.Maroto, sources []models.SourceCredential) {
	m.AddRow(10, text.NewCol(12, "Appendix - Sources", h2Style))
	m.AddRow(5, line.NewCol(12))

	headers := []string{"Source", "Id", "Added"}
	colWidths := []int{4, 6, 2}
	var headerCols []core.Col
	for i, h := range headers {
		headerCols = append(headerCols, text.NewCol(colWidths[i], h, tableHeaderStyle))
	}
	m.AddRow(10, headerCols...).WithStyle(&tableHeaderCell)

	for _, source := range sources {
		sourceName := "Fasten (manual)"
		if source.Display != "" {
			sourceName = source.Display
		}
		addedAt := source.CreatedAt.Format("2006-01-02")

		row := []core.Col{
			newTextCol(colWidths[0], sourceName),
			newTextCol(colWidths[1], source.ID.String()),
			newTextCol(colWidths[2], addedAt),
		}
		m.AddAutoRow(row...).WithStyle(&tableBodyCell)
	}

	m.AddRow(12)
}

func renderSection(m core.Maroto, sectionType pkg.IPSSections, sectionData *ips.SectionData, isOptional bool) {
	if isOptional && len(sectionData.GetAllSectionResources()) == 0 {
		return
	}

	title := strings.Title(strings.ReplaceAll(string(sectionType), "_", " "))
	m.AddRow(10, text.NewCol(12, title, h2Style))
	m.AddRow(5, line.NewCol(12))

	switch sectionType {
	case pkg.IPSSectionsAllergiesIntolerances:
		renderAllergies(m, sectionData.AllergyIntolerance)
	case pkg.IPSSectionsMedicationSummary:
		renderMedicationSummary(m, sectionData)
	case pkg.IPSSectionsProblemList:
		renderProblemList(m, sectionData.Condition)
	case pkg.IPSSectionsImmunizations:
		renderImmunizations(m, sectionData.Immunization)
	case pkg.IPSSectionsHistoryOfProcedures:
		renderHistoryOfProcedures(m, sectionData.Procedure)
	case pkg.IPSSectionsMedicalDevices:
		renderMedicalDevices(m, sectionData.Device)
	case pkg.IPSSectionsDiagnosticResults:
		renderDiagnosticResults(m, sectionData)
	case pkg.IPSSectionsVitalSigns:
		renderVitalSigns(m, sectionData.Observation)
	case pkg.IPSSectionsHistoryOfIllness:
		renderHistoryOfIllness(m, sectionData.Condition)
	case pkg.IPSSectionsPregnancy:
		renderPregnancy(m, sectionData.Observation)
	case pkg.IPSSectionsSocialHistory:
		renderSocialHistory(m, sectionData.Observation)
	case pkg.IPSSectionsPlanOfCare:
		renderPlanOfCare(m, sectionData.CarePlan)
	case pkg.IPSSectionsFunctionalStatus:
		renderFunctionalStatus(m, sectionData.ClinicalImpression)
	case pkg.IPSSectionsAdvanceDirectives:
		renderAdvanceDirectives(m, sectionData.Consent)
	}
}

func renderAllergies(m core.Maroto, allergies []database.FhirAllergyIntolerance) {
	if len(allergies) == 0 {
		m.AddRow(10, text.NewCol(12, "No data available", props.Text{Style: fontstyle.Italic}))
		return
	}

	headers := []string{"Allergen", "Status", "Category", "Reaction", "Severity", "Onset"}
	colWidths := []int{2, 2, 2, 2, 2, 2}
	var headerCols []core.Col
	for i, h := range headers {
		headerCols = append(headerCols, text.NewCol(colWidths[i], h, tableHeaderStyle))
	}
	m.AddRow(10, headerCols...).WithStyle(&tableHeaderCell)

	for _, allergy := range allergies {
		allergen := pluckMapListValue(allergy.Code, "text", "display")
		status := pluckMapListValue(allergy.ClinicalStatus, "code", "")
		category := pluckMapListValue(allergy.Category, "code", "")
		reaction := pluckMapListValue(allergy.Manifestation, "text", "display")
		severity := pluckMapListValue(allergy.Criticality, "code", "")
		onset := "unknown"
		if allergy.Onset != nil {
			onset = allergy.Onset.Format("2006-01-02")
		}

		row := []core.Col{
			newTextCol(colWidths[0], allergen),
			newTextCol(colWidths[1], status),
			newTextCol(colWidths[2], category),
			newTextCol(colWidths[3], reaction),
			newTextCol(colWidths[4], severity),
			newTextCol(colWidths[5], onset),
		}
		m.AddAutoRow(row...).WithStyle(&tableBodyCell)
	}

	m.AddRow(12)
}

func renderMedicationSummary(m core.Maroto, data *ips.SectionData) {
	// Medication Requests
	m.AddRow(12, text.NewCol(12, "Medication Requests", props.Text{Style: fontstyle.Bold}))
	if len(data.MedicationRequest) == 0 {
		m.AddRow(10, text.NewCol(12, "No data available", props.Text{Style: fontstyle.Italic}))
	} else {
		headers := []string{"Medication", "Status", "Route", "Sig", "Comments", "Authored"}
		colWidths := []int{4, 1, 1, 2, 2, 2}
		var headerCols []core.Col
		for i, h := range headers {
			headerCols = append(headerCols, text.NewCol(colWidths[i], h, tableHeaderStyle))
		}
		m.AddRow(10, headerCols...).WithStyle(&tableHeaderCell)

		for _, req := range data.MedicationRequest {
			medication := pluckMapListValue(req.Code, "text", "display")
			status := pluckMapListValue(req.Status, "code", "")
			route := pluckMapListValue(req.Route, "text", "")
			sig := pluckMapListValue(req.DosageInstruction, "text", "")
			comments := pluckMapListValue(req.Note, "text", "")
			authored := ""
			if req.Authoredon != nil {
				authored = req.Authoredon.Format("2006-01-02")
			}

			row := []core.Col{
				newTextCol(colWidths[0], medication),
				newTextCol(colWidths[1], status),
				newTextCol(colWidths[2], route),
				newTextCol(colWidths[3], sig),
				newTextCol(colWidths[4], comments),
				newTextCol(colWidths[5], authored),
			}

			m.AddAutoRow(row...).WithStyle(&tableBodyCell)
		}
	}
	m.AddRow(10)

	// Medication Statements
	m.AddRow(12, text.NewCol(12, "Medication Statements", props.Text{Style: fontstyle.Bold}))
	if len(data.MedicationStatement) == 0 {
		m.AddRow(10, text.NewCol(12, "No data available", props.Text{Style: fontstyle.Italic}))
	} else {
		headers := []string{"Medication", "Status", "Sig", "Date"}
		colWidths := []int{4, 2, 4, 2}
		var headerCols []core.Col
		for i, h := range headers {
			headerCols = append(headerCols, text.NewCol(colWidths[i], h, tableHeaderStyle))
		}
		m.AddRow(10, headerCols...).WithStyle(&tableHeaderCell)

		for _, stmt := range data.MedicationStatement {
			medication := pluckMapListValue(stmt.Code, "text", "display")
			status := pluckMapListValue(stmt.Status, "code", "")
			sig := pluckMapListValue(stmt.DosageInstruction, "text", "")
			date := ""
			if stmt.Effective != nil {
				date = stmt.Effective.Format("2006-01-02")
			}

			row := []core.Col{
				newTextCol(colWidths[0], medication),
				newTextCol(colWidths[1], status),
				newTextCol(colWidths[2], sig),
				newTextCol(colWidths[3], date),
			}
			m.AddAutoRow(row...).WithStyle(&tableBodyCell)
		}
	}

	m.AddRow(12)
}

func renderProblemList(m core.Maroto, problems []database.FhirCondition) {
	if len(problems) == 0 {
		m.AddRow(10, text.NewCol(12, "No data available", props.Text{Style: fontstyle.Italic}))
		return
	}

	headers := []string{"Medical Problems", "Status", "Comments", "Onset Date"}
	colWidths := []int{5, 2, 3, 2}
	var headerCols []core.Col
	for i, h := range headers {
		headerCols = append(headerCols, text.NewCol(colWidths[i], h, tableHeaderStyle))
	}
	m.AddRow(10, headerCols...).WithStyle(&tableHeaderCell)

	for _, problem := range problems {
		medicalProblem := pluckMapListValue(problem.Code, "text", "display")
		status := pluckMapListValue(problem.ClinicalStatus, "code", "")
		comments := pluckMapListValue(problem.Note, "text", "")
		onsetDate := ""
		if problem.OnsetDate != nil {
			onsetDate = problem.OnsetDate.Format("2006-01-02")
		}

		row := []core.Col{
			newTextCol(colWidths[0], medicalProblem),
			newTextCol(colWidths[1], status),
			newTextCol(colWidths[2], comments),
			newTextCol(colWidths[3], onsetDate),
		}
		m.AddAutoRow(row...).WithStyle(&tableBodyCell)
	}

	m.AddRow(12)
}

func renderImmunizations(m core.Maroto, immunizations []database.FhirImmunization) {
	if len(immunizations) == 0 {
		m.AddRow(10, text.NewCol(12, "No data available", props.Text{Style: fontstyle.Italic}))
		return
	}

	headers := []string{"Immunization", "Status", "Dose Number", "Manufacturer", "Lot Number", "Date"}
	colWidths := []int{4, 2, 1, 2, 1, 2}
	var headerCols []core.Col
	for i, h := range headers {
		headerCols = append(headerCols, text.NewCol(colWidths[i], h, tableHeaderStyle))
	}
	m.AddRow(10, headerCols...).WithStyle(&tableHeaderCell)

	for _, immunization := range immunizations {
		immunizationName := pluckMapListValue(immunization.VaccineCode, "text", "display")
		status := pluckMapListValue(immunization.Status, "code", "")
		doseNumber := pluckMapListValue(immunization.DoseNumber, "text", "")
		manufacturer := pluckMapListValue(immunization.Manufacturer, "display", "")
		lotNumber := pluckMapListValue(immunization.LotNumber, "text", "")
		date := ""
		if immunization.Date != nil {
			date = immunization.Date.Format("2006-01-02")
		}

		row := []core.Col{
			newTextCol(colWidths[0], immunizationName),
			newTextCol(colWidths[1], status),
			newTextCol(colWidths[2], doseNumber),
			newTextCol(colWidths[3], manufacturer),
			newTextCol(colWidths[4], lotNumber),
			newTextCol(colWidths[5], date),
		}
		m.AddAutoRow(row...).WithStyle(&tableBodyCell)
	}

	m.AddRow(12)
}

func renderHistoryOfProcedures(m core.Maroto, procedures []database.FhirProcedure) {
	if len(procedures) == 0 {
		m.AddRow(10, text.NewCol(12, "No data available", props.Text{Style: fontstyle.Italic}))
		return
	}

	headers := []string{"Procedure", "Comments", "Date"}
	colWidths := []int{6, 4, 2}
	var headerCols []core.Col
	for i, h := range headers {
		headerCols = append(headerCols, text.NewCol(colWidths[i], h, tableHeaderStyle))
	}
	m.AddRow(10, headerCols...).WithStyle(&tableHeaderCell)

	for _, procedure := range procedures {
		procedureName := pluckMapListValue(procedure.Code, "text", "display")
		comments := pluckMapListValue(procedure.Note, "text", "")
		date := ""
		if procedure.Date != nil {
			date = procedure.Date.Format("2006-01-02")
		}

		row := []core.Col{
			newTextCol(colWidths[0], procedureName),
			newTextCol(colWidths[1], comments),
			newTextCol(colWidths[2], date),
		}
		m.AddAutoRow(row...).WithStyle(&tableBodyCell)
	}

	m.AddRow(12)
}

func renderMedicalDevices(m core.Maroto, devices []database.FhirDevice) {
	if len(devices) == 0 {
		m.AddRow(10, text.NewCol(12, "No data available", props.Text{Style: fontstyle.Italic}))
		return
	}

	headers := []string{"Device", "Status", "Comments", "Date Recorded"}
	colWidths := []int{4, 2, 4, 2}
	var headerCols []core.Col
	for i, h := range headers {
		headerCols = append(headerCols, text.NewCol(colWidths[i], h, tableHeaderStyle))
	}
	m.AddRow(10, headerCols...).WithStyle(&tableHeaderCell)

	for _, device := range devices {
		deviceName := pluckMapListValue(device.Type, "text", "display")
		status := pluckMapListValue(device.Status, "code", "")
		comments := pluckMapListValue(device.Note, "text", "")
		date := ""
		// if device.RecordedDate != nil {
		// 	date = device.RecordedDate.Format("2006-01-02")
		// }

		row := []core.Col{
			newTextCol(colWidths[0], deviceName),
			newTextCol(colWidths[1], status),
			newTextCol(colWidths[2], comments),
			newTextCol(colWidths[3], date),
		}
		m.AddAutoRow(row...).WithStyle(&tableBodyCell)
	}

	m.AddRow(12)
}

func renderDiagnosticResults(m core.Maroto, data *ips.SectionData) {
	m.AddRow(12, text.NewCol(12, "Diagnostic Reports", props.Text{Style: fontstyle.Bold}))
	if len(data.DiagnosticReport) == 0 {
		m.AddRow(10, text.NewCol(12, "No data available", props.Text{Style: fontstyle.Italic}))
	} else {
		headers := []string{"Code", "Date"}
		colWidths := []int{8, 4}
		var headerCols []core.Col
		for i, h := range headers {
			headerCols = append(headerCols, text.NewCol(colWidths[i], h, tableHeaderStyle))
		}
		m.AddRow(10, headerCols...).WithStyle(&tableHeaderCell)

		for _, report := range data.DiagnosticReport {
			code := pluckMapListValue(report.Code, "text", "display")
			date := ""
			if report.Date != nil {
				date = report.Date.Format("2006-01-02")
			}

			row := []core.Col{
				newTextCol(colWidths[0], code),
				newTextCol(colWidths[1], date),
			}
			m.AddAutoRow(row...).WithStyle(&tableBodyCell)
		}
	}

	m.AddRow(10)

	m.AddRow(12, text.NewCol(12, "Observations", props.Text{Style: fontstyle.Bold}))
	if len(data.Observation) == 0 {
		m.AddRow(10, text.NewCol(12, "No data available", props.Text{Style: fontstyle.Italic}))
	} else {
		renderObservations(m, data.Observation, true)
	}

	m.AddRow(12)
}

func renderVitalSigns(m core.Maroto, observations []database.FhirObservation) {
	if len(observations) == 0 {
		m.AddRow(10, text.NewCol(12, "No data available", props.Text{Style: fontstyle.Italic}))
		return
	}
	renderObservations(m, observations, true)
}

func renderHistoryOfIllness(m core.Maroto, conditions []database.FhirCondition) {
	if len(conditions) == 0 {
		m.AddRow(10, text.NewCol(12, "No data available", props.Text{Style: fontstyle.Italic}))
		return
	}

	headers := []string{"Medical Problems", "Status", "Comments", "Date"}
	colWidths := []int{4, 2, 4, 2}
	var headerCols []core.Col
	for i, h := range headers {
		headerCols = append(headerCols, text.NewCol(colWidths[i], h, tableHeaderStyle))
	}
	m.AddRow(10, headerCols...).WithStyle(&tableHeaderCell)

	for _, condition := range conditions {
		problem := pluckMapListValue(condition.Code, "text", "display")
		status := pluckMapListValue(condition.ClinicalStatus, "code", "")
		comments := pluckMapListValue(condition.Note, "text", "")
		date := ""
		if condition.OnsetDate != nil {
			date = condition.OnsetDate.Format("2006-01-02")
		}

		row := []core.Col{
			newTextCol(colWidths[0], problem),
			newTextCol(colWidths[1], status),
			newTextCol(colWidths[2], comments),
			newTextCol(colWidths[3], date),
		}
		m.AddAutoRow(row...).WithStyle(&tableBodyCell)
	}

	m.AddRow(12)
}

func renderPregnancy(m core.Maroto, observations []database.FhirObservation) {
	if len(observations) == 0 {
		m.AddRow(10, text.NewCol(12, "No data available", props.Text{Style: fontstyle.Italic}))
		return
	}
	renderObservations(m, observations, false)
}

func renderSocialHistory(m core.Maroto, observations []database.FhirObservation) {
	if len(observations) == 0 {
		m.AddRow(10, text.NewCol(12, "No data available", props.Text{Style: fontstyle.Italic}))
		return
	}
	renderObservations(m, observations, true)
}

func renderPlanOfCare(m core.Maroto, carePlans []database.FhirCarePlan) {
	if len(carePlans) == 0 {
		m.AddRow(10, text.NewCol(12, "No data available", props.Text{Style: fontstyle.Italic}))
		return
	}

	headers := []string{"Activity", "Intent", "Comments", "Planned Start", "Planned End"}
	colWidths := []int{5, 1, 2, 2, 2}
	var headerCols []core.Col
	for i, h := range headers {
		headerCols = append(headerCols, text.NewCol(colWidths[i], h, tableHeaderStyle))
	}
	m.AddRow(10, headerCols...).WithStyle(&tableHeaderCell)

	for _, plan := range carePlans {
		activity := pluckMapListValue(plan.ActivityCode, "text", "display")
		intent := pluckMapListValue(plan.Intent, "code", "")
		comments := pluckMapListValue(plan.Note, "text", "")
		startDate := ""
		endDate := ""
		if plan.Date != nil {
			// Assuming Date is the start date, need to check the model for end date
			startDate = plan.Date.Format("2006-01-02")
		}

		row := []core.Col{
			newTextCol(colWidths[0], activity),
			newTextCol(colWidths[1], intent),
			newTextCol(colWidths[2], comments),
			newTextCol(colWidths[3], startDate),
			newTextCol(colWidths[4], endDate),
		}
		m.AddAutoRow(row...).WithStyle(&tableBodyCell)
	}

	m.AddRow(12)
}

func renderFunctionalStatus(m core.Maroto, impressions []database.FhirClinicalImpression) {
	if len(impressions) == 0 {
		m.AddRow(10, text.NewCol(12, "No data available", props.Text{Style: fontstyle.Italic}))
		return
	}

	headers := []string{"Assessment", "Status", "Finding", "Comments", "Date"}
	colWidths := []int{3, 2, 3, 2, 2}
	var headerCols []core.Col
	for i, h := range headers {
		headerCols = append(headerCols, text.NewCol(colWidths[i], h, tableHeaderStyle))
	}
	m.AddRow(10, headerCols...).WithStyle(&tableHeaderCell)

	for _, impression := range impressions {
		assessment := pluckMapListValue(impression.Identifier, "text", "")
		status := pluckMapListValue(impression.Status, "code", "")
		finding := pluckMapListValue(impression.FindingCode, "text", "display")
		comments := pluckMapListValue(impression.Note, "text", "")
		date := ""
		if impression.Date != nil {
			date = impression.Date.Format("2006-01-02")
		}

		row := []core.Col{
			newTextCol(colWidths[0], assessment),
			newTextCol(colWidths[1], status),
			newTextCol(colWidths[2], finding),
			newTextCol(colWidths[3], comments),
			newTextCol(colWidths[4], date),
		}
		m.AddAutoRow(row...).WithStyle(&tableBodyCell)
	}

	m.AddRow(12)
}

func renderAdvanceDirectives(m core.Maroto, consents []database.FhirConsent) {
	if len(consents) == 0 {
		m.AddRow(10, text.NewCol(12, "No data available", props.Text{Style: fontstyle.Italic}))
		return
	}

	headers := []string{"Scope", "Status", "Action Controlled", "Date"}
	colWidths := []int{3, 2, 5, 2}
	var headerCols []core.Col
	for i, h := range headers {
		headerCols = append(headerCols, text.NewCol(colWidths[i], h, tableHeaderStyle))
	}
	m.AddRow(10, headerCols...).WithStyle(&tableHeaderCell)

	for _, consent := range consents {
		scope := pluckMapListValue(consent.Scope, "text", "display")
		status := pluckMapListValue(consent.Status, "code", "")
		action := pluckMapListValue(consent.Action, "text", "display")
		date := ""
		if consent.Date != nil {
			date = consent.Date.Format("2006-01-02")
		}

		row := []core.Col{
			newTextCol(colWidths[0], scope),
			newTextCol(colWidths[1], status),
			newTextCol(colWidths[2], action),
			newTextCol(colWidths[3], date),
		}
		m.AddAutoRow(row...).WithStyle(&tableBodyCell)
	}

	m.AddRow(12)
}

func renderObservations(m core.Maroto, observations []database.FhirObservation, includeInterpretation bool) {
	headers := []string{"Code", "Result", "Unit", "Date"}
	colWidths := []int{3, 3, 3, 3}
	if includeInterpretation {
		headers = []string{"Code", "Result", "Unit", "Interpretation", "Reference Range", "Date"}
		colWidths = []int{3, 2, 1, 2, 2, 2}
	}

	var headerCols []core.Col
	for i, h := range headers {
		headerCols = append(headerCols, text.NewCol(colWidths[i], h, tableHeaderStyle))
	}
	m.AddRow(10, headerCols...).WithStyle(&tableHeaderCell)

	for _, observation := range observations {
		code := pluckMapListValue(observation.Code, "text", "display")
		result := getObservationValue(observation)
		unit := getObservationUnit(observation)
		date := ""
		if observation.Date != nil {
			date = observation.Date.Format("2006-01-02")
		}

		row := []core.Col{
			newTextCol(colWidths[0], code),
			newTextCol(colWidths[1], result),
			newTextCol(colWidths[2], unit),
		}

		if includeInterpretation {
			interpretation := pluckMapListValue(observation.Interpretation, "text", "display")
			refRange := pluckMapListValue(observation.ReferenceRange, "text", "")
			row = append(row, newTextCol(colWidths[3], interpretation), newTextCol(colWidths[4], refRange))
		}

		row = append(row, newTextCol(colWidths[len(row)-1], date))
		m.AddAutoRow(row...).WithStyle(&tableBodyCell)
	}

	m.AddRow(12)
}
