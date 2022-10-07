export class Base64 {
  public static Encode(data: string): string {
    return `b64.${btoa(data)}`
  }
  public static Decode(data: string): string {
    const parts = data.split(".")
    if(parts.length != 2){
      throw new Error(`invalid base64 encoded string: ${data}`)
    }
    return atob(parts[1])
  }
}
