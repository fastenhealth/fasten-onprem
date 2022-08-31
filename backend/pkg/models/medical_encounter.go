package models

import "time"

// https://reference.humanapi.co/reference/encounters
type Encounter struct {
	OriginBase

	DateTime  time.Time `json:"time,omitempty"`                                         //dateTime	Date	(optional) The date of the encounter
	VisitType *string   `json:"visitType,omitempty"`                                    // visitType	String	(optional) The type of visit
	Provider  Provider  `json:"provider,omitempty" gorm:"serializer:json;default:'{}'"` // provider	Object	(optional) The provider for the encounter (see provider object)
	//Prescriptions []Prescription `json:"prescriptions,omitempty"` // prescriptions	Array[Object]	(optional) A list of prescriptions provided during the encounter (see link object)
	//Diagnoses []Diagnosis `json:"diagnoses,omitempty"` // diagnoses	Array[Object]	(optional) A list of diagnoses for the encounter where object contains a "name" field e.g. *[{"name": "Sacroiliac dysfunction"}, {"name": "Bilateral hand pain"}]
	//vitals	Object	(optional) Vitals captured during the encounter (e.g. {"temperature" : 95.2 [degF]","weight" : 180 [lb_av]","height" : "69 [in_us]"})
	//vitalSigns	Array[Object]	(optional) A list of vital signs from the encounter (see link object)
	Reasons []string `json:"reasons,omitempty"`                                    // reasons	Array[String]	(optional) A list of reasons for the encounter (e.g. [‘Follow-up’, 'Consult’, 'DYSPHONIA', 'Back Pain’])
	Orders  []Order  `json:"orders,omitempty" gorm:"serializer:json;default:'{}'"` // orders	Array[Object]	(optional) A list of medication orders for the patient (see orders object)
	//testResults	Array[Object]	(optional) A list of test results for the patient (see link object)
	//plansOfCare	Array[Object]	(optional) A list of plans of care from the encounter (see link object)
	//medications	Array[Object]	(optional) A list of medications used by the patient. Objects in array can have some or many of the properties of medications. Common properties are "name", "productName", "startDate", "endDate", "instructions".
	FollowUpInstructions *string `json:"followUpInstructions,omitempty"` // followUpInstructions	String	(optional) Follow-up instructions
	//Organization Organization `json:"organization,omitempty"` // organization	Object	(optional) (See organizations object)
	//codes	Array[Object]	(optional) (See codes)
}

type Order struct {
	Name          *string   `json:"name,omitempty"`          // name	String	(optional) The name of the order
	CodeType      *string   `json:"codeType,omitempty"`      // codeType	String	(optional) The code type of the order (e.g. “CPT( R )”, “Custom”)
	ExpectedDate  time.Time `json:"expectedDate,omitempty"`  // expectedDate	Date	(optional) The date the order is expected
	ExpireDate    time.Time `json:"expireDate,omitempty"`    // expireDate	Date	(optional) The date the order expires
	ProcedureCode *string   `json:"procedureCode,omitempty"` // procedureCode	String	(optional) The procedure code of the order
	OrderType     *string   `json:"type,omitempty"`          // type	String	(optional) The type of the order (e.g. “Lab”, “Procedures”)
	//Name string `codes:"codes,omitempty"` // codes	Array[Object]	(optional) (See codes)
}

type Provider struct {
	Name           *string `json:"name,omitempty"`           //name	String	(optional) Name of the provider
	DepartmentName *string `json:"departmentName,omitempty"` //departmentName	String	(optional) Name of the provider department
	Address        *string `json:"address,omitempty"`        //address	String	(optional) Address of the provider
}
