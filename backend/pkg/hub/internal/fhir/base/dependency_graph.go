package base

import "github.com/samber/lo"

//based on algorithm - https://stackoverflow.com/a/5288547
type DependencyGraph map[string][]string

func (d DependencyGraph) AddDependencies(resourceRef string, dependencyResourceRefs []string) {
	//check to see if the resourceRef already has an entry in the graph, if not, add it

	if _, dependencyListExists := d[resourceRef]; !dependencyListExists {
		//the dependency list doesnt exist yet for this ref
		d[resourceRef] = []string{}
	}

	for _, dependencyResourceRef := range dependencyResourceRefs {
		dependencyList, dependencyListExists := d[dependencyResourceRef]
		if !dependencyListExists {
			//the dependency list doesnt exist yet for this ref
			dependencyList = []string{}
		}

		//add the current item to the list, then make sure the list is unique.
		dependencyList = append(dependencyList, resourceRef)
		uniqDependencyList := lo.Uniq[string](dependencyList)
		d[dependencyResourceRef] = uniqDependencyList
	}
}
