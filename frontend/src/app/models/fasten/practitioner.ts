export interface Practitioner {
  full_name: string;
  address: {
    line: string[];
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  
  email?: string;
  emailUse?: string; 
  phone?: string;
  phoneUse?: string; 
  fax?: string;
  faxUse?: string;
  
  jobTitle?: string;
  organization?: string;
  qualification?: any; 
  
  telecom?: {
    system: string;
    value: string;
    use: string;
  };
  
  formattedAddress: string;
  formattedTelecom: string;
  
  source_resource_id?: string; 
  source_id?: string;
  source_resource_type?: string;

  isFavorite?: boolean;

  resource_raw?: any;

}