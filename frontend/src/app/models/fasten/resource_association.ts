
export class ResourceAssociation {
  source_id: string
  source_resource_type: string
  source_resource_id: string

  old_related_source_id?: string
  old_related_source_resource_type?: string
  old_related_source_resource_id?: string


  new_related_source_id: string
  new_related_source_resource_type: string
  new_related_source_resource_id: string
}
