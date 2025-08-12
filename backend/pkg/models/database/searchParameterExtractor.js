function fhirpathEvaluate(fhirResource, expression){
    return window.fhirpath.evaluate(fhirResource, expression)
}

function extractSimpleSearchParameters(fhirResource, expression){
    //TODO: we may end up losing some information here, as we are only returning the first element of the array
    return fhirpathEvaluate(fhirResource, expression)[0]
}

function extractStringSearchParameters(fhirResource, expression){
    let result = fhirpathEvaluate(fhirResource, expression)

    let processed = result.reduce((accumulator, currentValue) => {
        if (typeof currentValue === 'string') {
            //basic string
            accumulator.push(currentValue)
        } else if (currentValue.family  || currentValue.given) {
            //HumanName http://hl7.org/fhir/R4/datatypes.html#HumanName
            var humanNameParts = []
            if (currentValue.prefix) {
                humanNameParts = humanNameParts.concat(currentValue.prefix)
            }
            if (currentValue.given) {
                humanNameParts = humanNameParts.concat(currentValue.given)
            }
            if (currentValue.family) {
                humanNameParts.push(currentValue.family)
            }
            if (currentValue.suffix) {
                humanNameParts = humanNameParts.concat(currentValue.suffix)
            }
            accumulator.push(humanNameParts.join(" "))
        } else if (currentValue.city || currentValue.state || currentValue.country || currentValue.postalCode) {
            //Address http://hl7.org/fhir/R4/datatypes.html#Address
            var addressParts = []
            if (currentValue.line) {
                addressParts = addressParts.concat(currentValue.line)
            }
            if (currentValue.city) {
                addressParts.push(currentValue.city)
            }
            if (currentValue.state) {
                addressParts.push(currentValue.state)
            }
            if (currentValue.postalCode) {
                addressParts.push(currentValue.postalCode)
            }
            if (currentValue.country) {
                addressParts.push(currentValue.country)
            }
            accumulator.push(addressParts.join(" "))
        } else if (currentValue.status && currentValue.div) {
            // Text (Narrative - http://hl7.org/fhir/R4/narrative.html#Narrative)
            accumulator.push(currentValue.div)
        } else {
            //string, boolean
            accumulator.push(currentValue)
        }
        return accumulator
    }, [])

    if(processed.length === 0) {
        return "undefined"
    }
    else {
        return JSON.stringify(processed)
    }

}

function extractTokenSearchParameters(fhirResource, expression){
    let result = fhirpathEvaluate(fhirResource, expression)

    let processed = result.reduce((accumulator, currentValue) => {
        if (currentValue.coding) {
            //CodeableConcept
            currentValue.coding.map((coding) => {
                accumulator.push({
                    "code": coding.code,
                    "system": coding.system,
                    "text": coding.display || currentValue.text
                })
            })
        } else if (currentValue.value) {
            //ContactPoint, Identifier
            accumulator.push({
                "code": currentValue.value,
                "system": currentValue.system,
                "text": currentValue.type?.text
            })
        } else if (currentValue.code) {
            //Coding
            accumulator.push({
                "code": currentValue.code,
                "system": currentValue.system,
                "text": currentValue.display
            })
        } else if ((typeof currentValue === 'string') || (typeof currentValue === 'boolean')) {
            //string, boolean
            accumulator.push({
                "code": currentValue,
            })
        }
        return accumulator
    }, [])

    if(processed.length === 0) {
        return "undefined"
    }
    else {
        return JSON.stringify(processed)
    }
}

function extractReferenceSearchParameters(fhirResource, expression){
    let result = fhirpathEvaluate(fhirResource, expression)

    if(result.length === 0) {
        return "undefined"
    }
    else {
        return JSON.stringify(result)
    }
}

//this is not ideal, we're extracting only the start or end of the period
function extractDateSearchParameters(fhirResource, expression){
    let result = fhirpathEvaluate(fhirResource, expression)

    let processed = result.reduce((accumulator, currentValue) => {
        if (typeof currentValue === 'string') {
            //basic datetime string
            accumulator.push(currentValue)
        } else if (currentValue.start  || currentValue.end) {
            //Period http://hl7.org/fhir/R4/datatypes.html#Period

            if (currentValue.start) {
                accumulator.push(currentValue.start)
            } else if (currentValue.end) {
                accumulator.push(currentValue.end)
            }
        } else {
            //ignore, this is unknown or unsupported type (or Timing)
        }
        return accumulator
    }, [])

    if(processed.length === 0) {
        return "undefined"
    }
    else {
        return processed[0]
    }
}

function extractCatchallSearchParameters(fhirResource, expression){
    let result = fhirpathEvaluate(fhirResource, expression)
    return JSON.stringify(result)
}
